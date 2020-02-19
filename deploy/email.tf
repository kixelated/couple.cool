resource "aws_ses_domain_identity" "wedding" {
	domain = "couple.cool"
}

resource "aws_route53_record" "email_record" {
	zone_id = data.aws_route53_zone.wedding.id
	name    = "_amazonses.couple.cool"
	type    = "TXT"
	ttl     = "600"
	records = [ aws_ses_domain_identity.wedding.verification_token ]
}

resource "aws_ses_domain_identity_verification" "email_verify" {
	domain = aws_ses_domain_identity.wedding.id

	depends_on = [ aws_route53_record.email_record ]
}
