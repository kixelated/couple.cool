resource "aws_dynamodb_table_item" "penny" {
  table_name = aws_dynamodb_table.items.name
  hash_key   = aws_dynamodb_table.items.hash_key

  item = <<ITEM
{
	"Id": { "S": "penny" },
	"Name": { "S": "Penny Sausage" },
	"Description": { "S": "Buy Penny from Andrew" },
	"Cost": { "N": "1000" },
	"Image": { "S": "http://${ aws_s3_bucket.web.bucket_regional_domain_name }/${ aws_s3_bucket_object.penny.key }" }
}
ITEM
}

resource "aws_s3_bucket_object" "penny" {
	bucket  = aws_s3_bucket.web.bucket
  acl     = "public-read"

	key          = "images/sausage.png"
	source       = "images/sausage.png"
	etag         = filemd5("images/sausage.png")
	content_type = "image/png"
}

resource "aws_dynamodb_table_item" "acting" {
  table_name = aws_dynamodb_table.items.name
  hash_key   = aws_dynamodb_table.items.hash_key

  item = <<ITEM
{
	"Id": { "S": "acting" },
	"Name": { "S": "Acting Classes for Rebe" },
	"Description": { "S": "\"You could star in MOVIES\" -- somebody on the street" },
	"Cost": { "N": "200" }
}
ITEM
}

