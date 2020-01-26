provider "aws" {
  profile = "registry"
  region  = "us-west-2"
}

resource "aws_dynamodb_table" "items" {
	name           = "registry.items"
	billing_mode   = "PROVISIONED"
	write_capacity = 1
	read_capacity  = 5

	hash_key = "Id"

	attribute {
	    name = "Id"
	    type = "S"
	}
}

resource "aws_s3_bucket" "web" {
	bucket = "luke-rebe-wedding-registry"
	acl    = "public-read"

	tags = {
		Name        = "My bucket"
		Environment = "Dev"
	}
}
