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

resource "aws_route53_record" "mx" {
	zone_id = data.aws_route53_zone.wedding.zone_id
	name    = aws_ses_domain_identity.wedding.id
	type    = "MX"
	ttl     = "600"
	records = [ "10 inbound-smtp.us-west-2.amazonaws.com" ]
}

resource "aws_route53_record" "txt" {
	zone_id = data.aws_route53_zone.wedding.zone_id
	name    = aws_ses_domain_identity.wedding.id
	type    = "TXT"
	ttl     = "600"
	records = [ "v=spf1 include:amazonses.com ~all" ]
}

resource "aws_ses_receipt_rule_set" "default" {
	rule_set_name = "couple.cool"
}

resource "aws_ses_active_receipt_rule_set" "default" {
	rule_set_name = aws_ses_receipt_rule_set.default.rule_set_name
}

resource "aws_s3_bucket" "emails" {
	bucket = "emails.couple.cool"
	acl    = "private"

	lifecycle_rule {
		enabled = true
		expiration {
			days = 90
		}
	}
}

resource "aws_ses_receipt_rule" "store" {
	name          = "store"
	rule_set_name = aws_ses_receipt_rule_set.default.rule_set_name
	recipients    = [
		"luke@couple.cool",
		"rebe@couple.cool",
	]
	enabled       = true
	scan_enabled  = true

	s3_action {
		bucket_name = aws_s3_bucket.emails.bucket
		position    = 1
	}

	lambda_action {
		function_arn = aws_lambda_function.forward.arn
		position = 2
	}
}

data "aws_iam_policy_document" "store" {
	statement {
		sid = "GiveSESPermissionToWriteEmail"

		effect = "Allow"

		principals {
			identifiers = [ "ses.amazonaws.com" ]
			type        = "Service"
		}

		actions = [ "s3:PutObject" ]

		resources = [ "${aws_s3_bucket.emails.arn}/*" ]

		condition {
			test     = "StringEquals"
			values   = [ data.aws_caller_identity.current.account_id ]
			variable = "aws:Referer"
		}
	}
}

resource "aws_s3_bucket_policy" "store" {
	bucket = aws_s3_bucket.emails.id
	policy = data.aws_iam_policy_document.store.json
}

data "local_file" "email_thanks_html" {
	filename = "../email/thanks.html"
}

data "local_file" "email_thanks_text" {
	filename = "../email/thanks.txt"
}

resource "aws_ses_template" "thanks" {
	name = "couple_cool_thanks"
	html = data.local_file.email_thanks_html.content
	text = data.local_file.email_thanks_text.content
	subject = "Thank you for your gift!"
}
