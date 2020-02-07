provider "aws" {
	region  = "us-west-2"
}

provider "aws" {
	alias = "virginia"
	region = "us-east-1"
}

terraform {
	backend "s3" {
		bucket = "wedding-state"
		key = "terraform"
		region = "us-west-2"
	}
}
