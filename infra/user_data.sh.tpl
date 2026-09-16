#!/bin/bash
set -euxo pipefail

dnf update -y
dnf install -y docker git unzip

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

rm -rf /opt/app /opt/app-stable /opt/app-archive
git clone ${repo_url} /opt/app
cd /opt/app

# URL versioning pipeline (docs/url-versioning-pipeline.md): /opt/app tracks
# the active-development ref (Iteration N+1 in progress) and is served under
# /underdevelopment/. A second worktree checked out at the stable ref (last
# complete iteration) is served at the live root, and a third at the
# archive ref (a retired iteration) is served under /version1/.
git worktree add /opt/app-stable ${stable_ref}
git worktree add /opt/app-archive ${archive_ref}

NVIDIA_API_KEY=$(aws ssm get-parameter --name "${nvidia_param_name}" --with-decryption --region ${region} --query 'Parameter.Value' --output text)
POSTGRES_PASSWORD=$(aws ssm get-parameter --name "${db_password_param_name}" --with-decryption --region ${region} --query 'Parameter.Value' --output text)

cat > /opt/app/.env <<EOF
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
NVIDIA_API_KEY=$NVIDIA_API_KEY
CORS_ORIGIN=${cors_origin}
DOMAIN=${domain_name}
ACME_EMAIL=${acme_email}
EOF

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

$COMPOSE exec -T backend npm run import:asic
$COMPOSE exec -T backend npm run import:oaic
