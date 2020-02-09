locals {
	mime_types = {
		html = "text/html; charset=utf-8"
		css = "text/css; charset=utf-8"
		js = "application/javascript"
		png = "image/png"
		jpg = "image/jpeg"
	}
}

resource "aws_s3_bucket" "web" {
	bucket = "couple.cool"
	acl    = "public-read"

	website {
		index_document = "index.html"
	}
}

resource "aws_s3_bucket_object" "web" {
	bucket  = aws_s3_bucket.web.bucket
	acl     = "public-read"

	for_each = fileset("${path.module}/../web", "**/*")

	key    = each.value
	source = "${path.module}/../web/${each.value}"
	etag   = filemd5("${path.module}/../web/${each.value}")
	content_type = local.mime_types[reverse(split(".", each.value))[0]]
}
