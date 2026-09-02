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

rm -rf /opt/app
git clone ${repo_url} /opt/app
cd /opt/app

GROQ_API_KEY=$(aws ssm get-parameter --name "${groq_param_name}" --with-decryption --region ${region} --query 'Parameter.Value' --output text)
POSTGRES_PASSWORD=$(aws ssm get-parameter --name "${db_password_param_name}" --with-decryption --region ${region} --query 'Parameter.Value' --output text)

cat > /opt/app/.env <<EOF
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
GROQ_API_KEY=$GROQ_API_KEY
CORS_ORIGIN=${cors_origin}
EOF

docker compose up -d --build
