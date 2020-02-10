resource "aws_cloudfront_distribution" "wedding" {
	origin {
		origin_id   = "s3"
		domain_name = aws_s3_bucket.wedding.bucket_regional_domain_name
	}

	origin {
		origin_id   = "api"
		domain_name = replace(aws_api_gateway_deployment.wedding.invoke_url, "/^https?://([^/]*).*/", "$1")

		custom_origin_config {
			http_port              = 80
			https_port             = 443
			origin_protocol_policy = "https-only"
			origin_ssl_protocols   = ["TLSv1.2"]
		}
	}

	enabled             = true
	is_ipv6_enabled     = true
	default_root_object = "index.html"

	price_class = "PriceClass_100"

	aliases = [ "couple.cool" ]

	default_cache_behavior {
		allowed_methods  = [ "GET", "HEAD", "OPTIONS" ]
		cached_methods   = [ "GET", "HEAD" ]
		target_origin_id = "s3"

		forwarded_values {
			query_string = false

			cookies {
				forward = "none"
			}
		}

		default_ttl = 60

		viewer_protocol_policy = "redirect-to-https"
	}

	ordered_cache_behavior {
		target_origin_id = "api"

		path_pattern     = "/api/*"
		allowed_methods  = [ "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT" ]
		cached_methods   = [ "GET", "HEAD" ]

		default_ttl = 10
		min_ttl     = 0
		max_ttl     = 60
		
		forwarded_values {
			query_string = true
			cookies {
				forward = "all"
			}
		}

		viewer_protocol_policy = "redirect-to-https"
	}

	restrictions {
		geo_restriction {
			restriction_type = "none"
		}
	}

	viewer_certificate {
		acm_certificate_arn = aws_acm_certificate.cert.arn
		cloudfront_default_certificate = true
		ssl_support_method = "sni-only"
	}
}

resource "aws_route53_record" "root_domain" {
	zone_id = data.aws_route53_zone.wedding.zone_id
	name = data.aws_route53_zone.wedding.name
	type = "A"

	alias {
		name = aws_cloudfront_distribution.wedding.domain_name
		zone_id = aws_cloudfront_distribution.wedding.hosted_zone_id
		evaluate_target_health = false
	}
}
