data "archive_file" "wedding" {
	type        = "zip"
	source_dir = "${path.module}/../api"
	output_path = "${path.module}/api.zip"
}

resource "aws_iam_role" "lambda_role" {
	name = "lambda_role"
	assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_lambda_function" "wedding" {
	filename         = data.archive_file.wedding.output_path
	function_name    = "wedding"
	role             = aws_iam_role.lambda_role.arn
	handler          = "lambda.handler"
	source_code_hash = data.archive_file.wedding.output_base64sha256
	runtime          = "nodejs12.x"
}

resource "aws_lambda_permission" "apigw" {
	statement_id  = "AllowAPIGatewayInvoke"
	action        = "lambda:InvokeFunction"
	function_name = aws_lambda_function.wedding.function_name
	principal     = "apigateway.amazonaws.com"

	source_arn = "${aws_api_gateway_rest_api.wedding.execution_arn}/*/*"
}
