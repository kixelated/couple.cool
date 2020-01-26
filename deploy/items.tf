resource "aws_dynamodb_table_item" "items" {
  table_name = aws_dynamodb_table.items.name
  hash_key   = aws_dynamodb_table.items.hash_key

	for_each = {
		sausage = <<ITEM
		{
			"Id": { "S": "sausage" },
			"Name": { "S": "Penny Treats" },
			"Description": { "S": "Yaaaay" },
			"Cost": { "N": "10" },
			"Image": { "S": "http://${ aws_s3_bucket.web.bucket_regional_domain_name }/${ aws_s3_bucket_object.items["sausage"].key }" }
		}
ITEM

	camera = <<ITEM
		{
			"Id": { "S": "camera" },
			"Name": { "S": "Digital Camera" },
			"Description": { "S": "Cell phone cameras are cool but 'professional' cameras are even cooler." },
			"Cost": { "N": "800" },
			"Image": { "S": "http://${ aws_s3_bucket.web.bucket_regional_domain_name }/${ aws_s3_bucket_object.items["camera"].key }" }
		}
ITEM

	pet = <<ITEM
		{
			"Id": { "S": "pet" },
			"Name": { "S": "Adopt" },
			"Description": { "S": "Dogo or cato?" },
			"Cost": { "N": "5000" },
			"Image": { "S": "http://${ aws_s3_bucket.web.bucket_regional_domain_name }/${ aws_s3_bucket_object.items["pet"].key }" }
		}
ITEM

	bear = <<ITEM
		{
			"Id": { "S": "bear" },
			"Name": { "S": "Cute Bear" },
			"Description": { "S": "Free picture of a cute bear" },
			"Cost": { "N": "0" },
			"Image": { "S": "http://${ aws_s3_bucket.web.bucket_regional_domain_name }/${ aws_s3_bucket_object.items["bear"].key }" }
		}
ITEM

	sausage2 = <<ITEM
		{
			"Id": { "S": "sausage2" },
			"Name": { "S": "Buy Penny" },
			"Description": { "S": "yaaay penny" },
			"Cost": { "N": "4000" },
			"Image": { "S": "http://${ aws_s3_bucket.web.bucket_regional_domain_name }/${ aws_s3_bucket_object.items["sausage2"].key }" }
		}
ITEM

	lolo = <<ITEM
		{
			"Id": { "S": "lolo" },
			"Name": { "S": "Treats for Lolo" },
			"Description": { "S": "Lolo loves food" },
			"Cost": { "N": "20" },
			"Image": { "S": "http://${ aws_s3_bucket.web.bucket_regional_domain_name }/${ aws_s3_bucket_object.items["lolo"].key }" }
		}
ITEM

	sausage3 = <<ITEM
		{
			"Id": { "S": "sausage3" },
			"Name": { "S": "Steal Penny" },
			"Description": { "S": "Screw this lets just steal penny." },
			"Cost": { "N": "50" },
			"Image": { "S": "http://${ aws_s3_bucket.web.bucket_regional_domain_name }/${ aws_s3_bucket_object.items["sausage3"].key }" }
		}
ITEM

	foxy = <<ITEM
		{
			"Id": { "S": "foxy" },
			"Name": { "S": "Steal Foxy" },
			"Description": { "S": "Or steal foxy." },
			"Cost": { "N": "8000" },
			"Image": { "S": "http://${ aws_s3_bucket.web.bucket_regional_domain_name }/${ aws_s3_bucket_object.items["foxy"].key }" }
		}
ITEM

	classy = <<ITEM
		{
			"Id": { "S": "classy" },
			"Name": { "S": "Cheap Wine" },
			"Description": { "S": "We don't like wine so this will go towards the cheapest option" },
			"Cost": { "N": "5" },
			"Image": { "S": "http://${ aws_s3_bucket.web.bucket_regional_domain_name }/${ aws_s3_bucket_object.items["classy"].key }" }
		}
ITEM
	}

  item = each.value
}

resource "aws_s3_bucket_object" "items" {
	bucket  = aws_s3_bucket.web.bucket
	acl     = "public-read"

	for_each = {
		sausage = "images/sausage.png"
		camera = "images/camera.png"
		pet = "images/pet.png"
		bear = "images/bear.png"
		sausage2 = "images/sausage2.png"
		lolo = "images/lolo.png"
		sausage3 = "images/sausage3.png"
		foxy = "images/foxy.png"
		classy = "images/classy.png"
	}

	key          = each.value
	source       = each.value
	etag         = filemd5(each.value)
	content_type = each.value
}
