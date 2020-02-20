data "archive_file" "forward" {
	type        = "zip"
	source_dir = "${path.module}/../forward"
	output_path = "${path.module}/forward.zip"
}

resource "aws_iam_role" "forward" {
	name               = "forward"
	assume_role_policy = data.aws_iam_policy_document.assume.json
}

data "aws_iam_policy_document" "forward" {
	statement {
		effect = "Allow"

		actions = [
			"logs:CreateLogGroup",
			"logs:CreateLogStream",
			"logs:PutLogEvents"
		]

		resources = [ "*" ]
	}

	statement {
		effect = "Allow"

		actions = [
			"ses:SendEmail",
			"ses:SendRawEmail"
		]

		resources = [ "*" ]
	}

	statement {
		effect = "Allow"

		actions = [
			"s3:GetObject",
			"s3:PutObject"
		]

		resources = [ "${aws_s3_bucket.emails.arn}/*" ]
	}
}

resource "aws_iam_policy" "forward" {
	name        = "forward"
	policy      = data.aws_iam_policy_document.forward.json
}

resource "aws_iam_role_policy_attachment" "forward" {
	role       = aws_iam_role.forward.name
	policy_arn = aws_iam_policy.forward.arn
}

resource "aws_lambda_function" "forward" {
	filename         = data.archive_file.forward.output_path
	function_name    = "forward"
	role             = aws_iam_role.forward.arn
	handler          = "index.handler"
	source_code_hash = data.archive_file.forward.output_base64sha256
	runtime          = "nodejs12.x"

	environment {
		variables = {
			EMAIL_BUCKET_NAME = aws_s3_bucket.emails.bucket
		}
	}
}

data "aws_caller_identity" "current" {}

resource "aws_lambda_permission" "ses" {
	statement_id   = "AllowExecutionFromSES"
	action         = "lambda:InvokeFunction"
	function_name  = aws_lambda_function.forward.function_name
	principal      = "ses.amazonaws.com"

	source_account = data.aws_caller_identity.current.account_id
}
