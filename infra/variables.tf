variable "aws_region" {
  type    = string
  default = "ap-southeast-2"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
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

variable "cors_origin" {
  description = "Allowed CORS origin for the backend/AI API. Same-origin requests via nginx aren't affected by this."
  type        = string
  default     = "http://localhost:5173"
}

variable "groq_api_key" {
  description = "Groq API key used by the ai-model service"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Password for the Postgres consent_app user"
  type        = string
  sensitive   = true
}
