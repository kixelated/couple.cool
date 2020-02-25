locals {
	mime_types = {
		html = "text/html; charset=utf-8"
		css = "text/css; charset=utf-8"
		js = "application/javascript"
		mjs = "application/javascript"
		png = "image/png"
		jpg = "image/jpeg"
		ico = "image/x-icon"
		webmanifest = "application/manifest+json"
		woff = "font/woff"
		woff2 = "font/woff2"
	}
}

resource "aws_s3_bucket" "wedding" {
	bucket = "couple.cool"
	acl    = "public-read"

	cors_rule {
		allowed_headers = [ "*" ]
		allowed_methods = [ "GET" ]
		allowed_origins = [ "*" ]
		expose_headers  = [ "ETag" ]
		max_age_seconds = 3000
	}
}

resource "aws_s3_bucket_object" "wedding" {
	bucket  = aws_s3_bucket.wedding.bucket
	acl    = "public-read"

	for_each = fileset("${path.module}/../web", "**/*")

	key           = each.value
	source        = "${path.module}/../web/${each.value}"
	etag          = filemd5("${path.module}/../web/${each.value}")
	content_type  = local.mime_types[reverse(split(".", each.value))[0]]
	cache_control = "max-age=60"
}
