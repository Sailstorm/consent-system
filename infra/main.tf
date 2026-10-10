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
  # list), not open to the internet. Fallback admin path; SSM Session
  # Manager is the primary one.
  ingress {
    description     = "EC2 Instance Connect"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    prefix_list_ids = ["pl-0e1bc5673b8a57acc"]
  }

  # Egress limited to web ports (security plan N-04, A-06). Everything the
  # host and containers legitimately reach is HTTP(S): NVIDIA, Hugging Face
  # (image builds only), HIBP, data.gov.au, GitHub, package mirrors, Docker
  # Hub, Let's Encrypt and the AWS SSM endpoints. The URL fetcher only
  # allows ports 80/443 too. DNS and NTP go to the VPC's link-local
  # resolver/time service, which security groups don't filter.
  egress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "HTTP (package mirrors, ACME, plain-HTTP policy pages)"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
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

# Password for the server-side site gate (security plan F-06).
resource "aws_ssm_parameter" "site_password" {
  name  = "/sailstorm/site_password"
  type  = "SecureString"
  value = var.site_password
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
        aws_ssm_parameter.site_password.arn,
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

    # Encrypted at rest with the account's default EBS key (security plan
    # N-03). Changing this on an existing instance forces a replacement;
    # the database only holds public ASIC/OAIC data, which user_data
    # re-imports on first boot.
    encrypted = true

    # Picked up by the daily snapshot policy below (security plan D-04).
    tags = {
      Name   = "sailstorm-app-root"
      Backup = "daily"
    }
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
    site_password_param    = aws_ssm_parameter.site_password.name
    cors_origin            = local.cors_origin
    domain_name            = var.domain_name
    acme_email             = var.acme_email
  })

  tags = {
    Name = "sailstorm-app"
  }

  # data.aws_ami.al2023 tracks most_recent, so a plain `terraform apply`
  # would otherwise propose replacing this instance (destroying its root
  # volume, and with it the Postgres data) every time AWS publishes a
  # newer AL2023 build - discovered the hard way when rotating a secret
  # unexpectedly planned a full instance replacement. Pinning ami here
  # means drift there no longer forces replacement of an existing
  # instance; a genuinely new instance (e.g. after a deliberate destroy)
  # still picks up whatever AMI is most recent at that time.
  lifecycle {
    ignore_changes = [ami]
  }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"
}

locals {
  # Same-origin by default: the frontend and APIs share the public domain.
  cors_origin = var.cors_origin != "" ? var.cors_origin : "https://${var.domain_name}"
}

# ---------------------------------------------------------------------------
# Backups (security plan D-04): daily snapshots of the root volume, which
# holds the PostgreSQL data, the Caddy certificates and the checkouts.
# Seven daily copies are kept.
# ---------------------------------------------------------------------------

resource "aws_iam_role" "dlm" {
  name = "sailstorm-dlm"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "dlm.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "dlm" {
  role       = aws_iam_role.dlm.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSDataLifecycleManagerServiceRole"
}

resource "aws_dlm_lifecycle_policy" "daily_root_snapshots" {
  description        = "Daily snapshots of the sailstorm app root volume"
  execution_role_arn = aws_iam_role.dlm.arn
  state              = "ENABLED"

  policy_details {
    resource_types = ["VOLUME"]
    target_tags = {
      Backup = "daily"
    }

    schedule {
      name      = "daily-7-day-retention"
      copy_tags = true

      create_rule {
        interval      = 24
        interval_unit = "HOURS"
        # 16:00 UTC is 02:00-03:00 in Melbourne, outside class hours.
        times = ["16:00"]
      }

      retain_rule {
        count = 7
      }
    }
  }
}

# ---------------------------------------------------------------------------
# Monitoring (security plan L-02, N-06): recover the instance automatically
# if AWS's own hardware checks fail, reboot it if the OS stops responding,
# and optionally email the team when either happens or CPU stays pinned
# (e.g. sustained abuse of the analyse routes).
# ---------------------------------------------------------------------------

resource "aws_sns_topic" "alerts" {
  name              = "sailstorm-alerts"
  kms_master_key_id = "alias/aws/sns"
}

resource "aws_sns_topic_subscription" "alerts_email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_metric_alarm" "system_check" {
  alarm_name          = "sailstorm-system-status-check"
  alarm_description   = "AWS host problem: recover the instance onto healthy hardware."
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed_System"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 2
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  dimensions          = { InstanceId = aws_instance.app.id }
  alarm_actions = [
    "arn:aws:automate:${var.aws_region}:ec2:recover",
    aws_sns_topic.alerts.arn,
  ]
}

resource "aws_cloudwatch_metric_alarm" "instance_check" {
  alarm_name          = "sailstorm-instance-status-check"
  alarm_description   = "The OS stopped responding: reboot the instance."
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed_Instance"
  statistic           = "Maximum"
  period              = 60
  evaluation_periods  = 3
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  dimensions          = { InstanceId = aws_instance.app.id }
  alarm_actions = [
    "arn:aws:automate:${var.aws_region}:ec2:reboot",
    aws_sns_topic.alerts.arn,
  ]
}

resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "sailstorm-high-cpu"
  alarm_description   = "CPU above 85% for 15 minutes: possible abuse or a stuck process."
  namespace           = "AWS/EC2"
  metric_name         = "CPUUtilization"
  statistic           = "Average"
  period              = 300
  evaluation_periods  = 3
  threshold           = 85
  comparison_operator = "GreaterThanThreshold"
  dimensions          = { InstanceId = aws_instance.app.id }
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
