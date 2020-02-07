data "aws_route53_zone" "wedding" {
	name = "couple.cool."
}

resource "aws_acm_certificate" "cert" {
	domain_name = data.aws_route53_zone.wedding.name
	validation_method = "DNS"
	provider = aws.virginia
}

resource "aws_route53_record" "cert_validation" {
	name    = aws_acm_certificate.cert.domain_validation_options.0.resource_record_name
	type    = aws_acm_certificate.cert.domain_validation_options.0.resource_record_type
	zone_id = data.aws_route53_zone.wedding.id
	records = [ aws_acm_certificate.cert.domain_validation_options.0.resource_record_value ]
	ttl     = 60
}

resource "aws_acm_certificate_validation" "wedding" {
	certificate_arn         = aws_acm_certificate.cert.arn
	validation_record_fqdns = [ aws_route53_record.cert_validation.fqdn ]
	provider = aws.virginia
}

resource "aws_api_gateway_domain_name" "wedding" {
	certificate_arn = aws_acm_certificate_validation.wedding.certificate_arn
	domain_name     = "couple.cool"
}

resource "aws_route53_record" "wedding" {
	name    = aws_api_gateway_domain_name.wedding.domain_name
	type    = "A"
	zone_id = data.aws_route53_zone.wedding.id

	alias {
		evaluate_target_health = true
		name                   = aws_api_gateway_domain_name.wedding.cloudfront_domain_name
		zone_id                = aws_api_gateway_domain_name.wedding.cloudfront_zone_id
	}
}
