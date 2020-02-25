resource "aws_dynamodb_table" "rsvp" {
	name           = "couple.cool.rsvp"
	billing_mode   = "PROVISIONED"
	write_capacity = 1
	read_capacity  = 1

	hash_key = "Email"

	attribute {
	    name = "Email"
	    type = "S"
	}
}
