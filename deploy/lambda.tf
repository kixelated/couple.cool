data "archive_file" "wedding" {
	type        = "zip"
	source_dir = "${path.module}/../api"
	output_path = "${path.module}/api.zip"
}

resource "aws_iam_role" "wedding" {
	name = "wedding_role"
	assume_role_policy = data.aws_iam_policy_document.wedding_assume.json
}

resource "aws_iam_role_policy" "wedding" {
	name = "wedding_policy"
	role = aws_iam_role.wedding.id
	policy = data.aws_iam_policy_document.wedding_policy.json
}

data "aws_iam_policy_document" "wedding_assume" {
	statement {
		actions = [ "sts:AssumeRole" ]

		principals {
			type = "Service"
			identifiers = [ "lambda.amazonaws.com" ]
		}
	}
}

data "aws_iam_policy_document" "wedding_policy" {
	statement {
		actions = [ "dynamodb:*" ]
		resources = [ aws_dynamodb_table.items.arn ]
	}

	statement {
		actions = [ "logs:*" ]
		resources = [ aws_cloudwatch_log_group.wedding.arn ]
	}

	statement {
		actions = [ "secretsmanager:GetSecretValue" ]
		resources = [ data.aws_secretsmanager_secret.wedding_paypal.arn ]
	}
}

data "aws_secretsmanager_secret" "wedding_paypal" {
	name = "wedding_paypal"
}

resource "aws_cloudwatch_log_group" "wedding" {
	name = "/aws/lambda/wedding"
}

resource "aws_lambda_function" "wedding" {
	filename         = data.archive_file.wedding.output_path
	function_name    = "wedding"
	role             = aws_iam_role.wedding.arn
	handler          = "lambda.handler"
	source_code_hash = data.archive_file.wedding.output_base64sha256
	runtime          = "nodejs12.x"
}

resource "aws_lambda_permission" "apigw" {
	statement_id  = "AllowAPIGatewayInvoke"
	action        = "lambda:InvokeFunction"
	function_name = aws_lambda_function.wedding.function_name
	principal     = "apigateway.amazonaws.com"

	source_arn = "${aws_api_gateway_rest_api.wedding_api.execution_arn}/*/*"
}
