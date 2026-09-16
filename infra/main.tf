terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  # "al2023-ami-*" also matches the minimal variant
  # (al2023-ami-minimal-*), which most_recent can pick if it happens to be
  # the newer publish - and minimal images don't ship ec2-instance-connect
  # preinstalled, silently breaking SSH access (confirmed the hard way: an
  # apply landed on a minimal AMI and EC2 Instance Connect failed outright).
  # Requiring the literal year after "al2023-ami-" excludes "minimal-".
  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

resource "aws_security_group" "app" {
  name        = "sailstorm-app"
  description = "Allow HTTP(S) inbound to the sailstorm app host"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Browser/CLI-based SSH via EC2 Instance Connect only (AWS-managed prefix
  # list), not open to the internet. Fallback admin access path while SSM
  # registration is broken (see docs/pentest-plan.md, finding 7).
  ingress {
    description     = "EC2 Instance Connect"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    prefix_list_ids = ["pl-0e1bc5673b8a57acc"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ssm_parameter" "nvidia_api_key" {
  name  = "/sailstorm/nvidia_api_key"
  type  = "SecureString"
  value = var.nvidia_api_key
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/sailstorm/db_password"
  type  = "SecureString"
  value = var.db_password
}

resource "aws_iam_role" "app_host" {
  name = "sailstorm-app-host"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# Lets us connect via `aws ssm start-session` instead of managing SSH keys / open port 22.
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.app_host.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "read_app_parameters" {
  name = "read-sailstorm-parameters"
  role = aws_iam_role.app_host.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["ssm:GetParameter"]
      Resource = [
        aws_ssm_parameter.nvidia_api_key.arn,
        aws_ssm_parameter.db_password.arn,
      ]
    }]
  })
}

resource "aws_iam_instance_profile" "app_host" {
  name = "sailstorm-app-host"
  role = aws_iam_role.app_host.name
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = var.instance_type
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile   = aws_iam_instance_profile.app_host.name

  root_block_device {
    # 20GB was tight even before developed_ai: torch+transformers+accelerate
    # wheels, the downloaded DeBERTa weights, two git checkouts (main +
    # stable worktree), and several Docker images all share this disk.
    volume_size = 30
    volume_type = "gp3"
  }

  # IMDSv2 enforcement was applied manually out-of-band on the current
  # instance (not previously in Terraform) to remediate the finding in
  # docs/pentest-plan.md #5. Codified here so it survives instance replacement.
  metadata_options {
    http_tokens = "required"
  }

  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    repo_url               = var.repo_url
    stable_ref             = var.stable_ref
    archive_ref            = var.archive_ref
    region                 = var.aws_region
    nvidia_param_name      = aws_ssm_parameter.nvidia_api_key.name
    db_password_param_name = aws_ssm_parameter.db_password.name
    cors_origin            = var.cors_origin
    domain_name            = var.domain_name
    acme_email             = var.acme_email
  })

  tags = {
    Name = "sailstorm-app"
  }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"
}
