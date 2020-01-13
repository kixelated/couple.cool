provider "aws" {
  profile = "registry"
  region  = "us-west-2"
}

resource "aws_dynamodb_table" "items" {
  name           = "registry.items"
  billing_mode   = "PAY_PER_REQUEST"

  hash_key = "Id"

  attribute {
    name = "Id"
    type = "N"
  }
}

resource "aws_dynamodb_table_item" "item_0" {
  table_name = aws_dynamodb_table.items.name
  hash_key   = aws_dynamodb_table.items.hash_key

  item = <<ITEM
{
	"Id": { "N": "0" },
	"Name": { "S": "Rebe Acting Classes" },
	"Description": { "S": "Rebe could star in MOVIES" },
	"Cost": { "N": "200" }
}
ITEM
}

resource "aws_dynamodb_table_item" "item_1" {
  table_name = aws_dynamodb_table.items.name
  hash_key   = aws_dynamodb_table.items.hash_key

  item = <<ITEM
{
	"Id": { "N": "1" },
	"Name": { "S": "Penny Sausage" },
	"Description": { "S": "Buy Penny from Andrew" },
	"Cost": { "N": "1000" }
}
ITEM
}
