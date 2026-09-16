variable "aws_region" {
  type    = string
  default = "ap-southeast-2"
}

variable "instance_type" {
  # t3.micro (1GB RAM) can't fit developed_ai's local DeBERTa classifier
  # (torch+transformers, ~1.5-2GB alone) alongside db/backend/frontend/router
  # on the same host. t3.medium (4GB) covers it with headroom; Stage 2
  # (summarisation) is a NVIDIA-hosted API call, not local compute, so no
  # GPU/large-instance sizing is needed for that part.
  type    = string
  default = "t3.medium"
}

variable "repo_url" {
  type    = string
  default = "https://github.com/Sailstorm/consent-system.git"
}

variable "stable_ref" {
  description = "Git ref (tag/branch) for the last complete iteration, served at the live root. See docs/url-versioning-pipeline.md."
  type        = string
  default     = "iteration-1"
}

variable "domain_name" {
  description = "Public hostname the router (Caddy) requests a Let's Encrypt cert for. Defaults to a sslip.io hostname that resolves to the current Elastic IP with no DNS setup required — update if you move to a real domain."
  type        = string
  default     = "52-64-225-116.sslip.io"
}

variable "acme_email" {
  description = "Contact email registered with Let's Encrypt for TLS cert notices."
  type        = string
  default     = "saubhagyagupta2002@gmail.com"
}

variable "cors_origin" {
  description = "Allowed CORS origin for the backend/AI API. Same-origin requests via nginx aren't affected by this."
  type        = string
  default     = "http://localhost:5173"
}

variable "nvidia_api_key" {
  description = "NVIDIA API key used by the developed_ai service's Stage 2 summariser"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Password for the Postgres consent_app user"
  type        = string
  sensitive   = true
}
