provider "aws" {
	region  = "us-west-2"
}

terraform {
	backend "s3" {
		bucket = "wedding-state"
		key = "terraform"
		region = "us-west-2"
	}
}
