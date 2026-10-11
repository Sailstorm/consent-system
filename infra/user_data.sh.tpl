#!/bin/bash
set -euxo pipefail

# Track the latest Amazon Linux 2023 release rather than the one baked
# into the AMI, and apply security updates automatically every day
# (security plan N-08: the AMI is pinned in main.tf, so the OS image is
# never refreshed by replacement).
echo latest > /etc/dnf/vars/releasever
dnf upgrade -y
dnf install -y docker git unzip openssl dnf-automatic
sed -i -e 's/^upgrade_type.*/upgrade_type = security/' \
       -e 's/^apply_updates.*/apply_updates = yes/' /etc/dnf/automatic.conf
systemctl enable --now dnf-automatic.timer

systemctl enable --now docker

mkdir -p /usr/libexec/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/libexec/docker/cli-plugins/docker-compose
chmod +x /usr/libexec/docker/cli-plugins/docker-compose

curl -SL https://github.com/docker/buildx/releases/download/v0.36.1/buildx-v0.36.1.linux-amd64 \
  -o /usr/libexec/docker/cli-plugins/docker-buildx
chmod +x /usr/libexec/docker/cli-plugins/docker-buildx

curl -SL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install

if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

rm -rf /opt/app /opt/app-stable /opt/app-archive /opt/app-archive-2
git clone ${repo_url} /opt/app
cd /opt/app

# URL versioning pipeline (docs/url-versioning-pipeline.md): /opt/app tracks
# the active-development ref (Iteration N+1 in progress) and is served under
# /underdevelopment/. A second worktree checked out at the stable ref (last
# complete iteration) is served at the live root, and the retired
# iterations are served under /version1/ and /version2/.
git worktree add /opt/app-stable ${stable_ref}
git worktree add /opt/app-archive ${archive_ref}
git worktree add /opt/app-archive-2 ${archive2_ref}

# Secrets section: tracing OFF. With `set -x` on, bash prints every
# assignment, so the values below used to end up in plain text in
# /var/log/cloud-init-output.log.
set +x
NVIDIA_API_KEY=$(aws ssm get-parameter --name "${nvidia_param_name}" --with-decryption --region ${region} --query 'Parameter.Value' --output text)
POSTGRES_PASSWORD=$(aws ssm get-parameter --name "${db_password_param_name}" --with-decryption --region ${region} --query 'Parameter.Value' --output text)
GATE_PASSWORD=$(aws ssm get-parameter --name "${site_password_param}" --with-decryption --region ${region} --query 'Parameter.Value' --output text)
# Generated per instance: the gate's cookie-signing key and the read-only
# database role's password (security plan F-06, D-03).
GATE_SECRET=$(openssl rand -hex 32)
DB_READER_PASSWORD=$(openssl rand -hex 24)

# Readable by root only (it was world-readable).
umask 077
cat > /opt/app/.env <<EOF
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
DB_READER_PASSWORD=$DB_READER_PASSWORD
NVIDIA_API_KEY=$NVIDIA_API_KEY
GATE_PASSWORD=$GATE_PASSWORD
GATE_SECRET=$GATE_SECRET
CORS_ORIGIN=${cors_origin}
DOMAIN=${domain_name}
ACME_EMAIL=${acme_email}
EOF
chmod 600 /opt/app/.env
umask 022
set -x

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"
$COMPOSE up -d --build

# Wait for Postgres to be healthy, then load reference data (ASIC/OAIC) from
# data.gov.au. Idempotent (ON CONFLICT DO NOTHING), safe to run on every boot.
for i in $(seq 1 30); do
  if $COMPOSE exec -T db pg_isready -U consent_app -d consent_assistant >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

# Create (or update) the API's read-only role before it starts serving
# (security plan D-03), then load the reference data. The importers write,
# so they run as the owner role, not the API's read-only one. Tracing is
# off: both passwords appear on these lines.
set +x
$COMPOSE exec -T db psql -v ON_ERROR_STOP=1 -v reader_password="$DB_READER_PASSWORD" \
  -U consent_app -d consent_assistant -f - < /opt/app/database/roles.sql
OWNER_DATABASE_URL="postgresql://consent_app:$POSTGRES_PASSWORD@db:5432/consent_assistant"
$COMPOSE exec -T -e DATABASE_URL="$OWNER_DATABASE_URL" backend npm run import:asic
$COMPOSE exec -T -e DATABASE_URL="$OWNER_DATABASE_URL" backend npm run import:oaic
set -x
