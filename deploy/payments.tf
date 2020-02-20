resource "aws_dynamodb_table" "payments" {
	name           = "registry.payments"
	billing_mode   = "PROVISIONED"
	write_capacity = 1
	read_capacity  = 5

	hash_key  = "Item"
	range_key = "Order"

	attribute {
	    name = "Item"
	    type = "S"
	}

	attribute {
	    name = "Order"
	    type = "S"
	}

	point_in_time_recovery {
		enabled = true
	}
}
