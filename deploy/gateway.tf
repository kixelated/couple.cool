resource "aws_api_gateway_rest_api" "wedding" {
	name        = "wedding_api"
	description = "Wedding Registry API"
}

resource "aws_api_gateway_resource" "proxy" {
	rest_api_id = aws_api_gateway_rest_api.wedding.id
	parent_id   = aws_api_gateway_rest_api.wedding.root_resource_id
	path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
	rest_api_id   = aws_api_gateway_rest_api.wedding.id
	resource_id   = aws_api_gateway_resource.proxy.id
	http_method   = "ANY"
	authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
	rest_api_id = aws_api_gateway_rest_api.wedding.id
	resource_id = aws_api_gateway_method.proxy.resource_id
	http_method = aws_api_gateway_method.proxy.http_method

	integration_http_method = "POST"
	type                    = "AWS_PROXY"
	uri                     = aws_lambda_function.wedding.invoke_arn
}

resource "aws_api_gateway_deployment" "wedding" {
	depends_on = [ aws_api_gateway_integration.lambda ]

	rest_api_id = aws_api_gateway_rest_api.wedding.id
	stage_name  = "api"
}

resource "aws_api_gateway_base_path_mapping" "wedding" {
	api_id      = aws_api_gateway_rest_api.wedding.id
	stage_name  = aws_api_gateway_deployment.wedding.stage_name
	domain_name = aws_api_gateway_domain_name.wedding.domain_name
}

output "base_url" {
	value = aws_api_gateway_deployment.wedding.invoke_url
}
