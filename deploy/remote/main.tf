provider "aws" {
	profile = "wedding"
	region = "us-west-2"
}

resource "aws_s3_bucket" "state" {
	bucket = "wedding-state"

	versioning {
		enabled = true
	}

	lifecycle {
		prevent_destroy = true
	}
}
