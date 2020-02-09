resource "aws_api_gateway_rest_api" "wedding_api" {
       name        = "wedding_api"
       description = "Wedding API"
}


resource "aws_api_gateway_resource" "wedding_api" {
	rest_api_id = aws_api_gateway_rest_api.wedding_api.id
	parent_id   = aws_api_gateway_rest_api.wedding_api.root_resource_id
	path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "wedding_api" {
	rest_api_id   = aws_api_gateway_rest_api.wedding_api.id
	resource_id   = aws_api_gateway_resource.wedding_api.id
	http_method   = "ANY"
	authorization = "NONE"
}

resource "aws_api_gateway_integration" "wedding_api" {
	rest_api_id = aws_api_gateway_rest_api.wedding_api.id
	resource_id = aws_api_gateway_method.wedding_api.resource_id
	http_method = aws_api_gateway_method.wedding_api.http_method

	integration_http_method = "POST"
	type                    = "AWS_PROXY"
	uri                     = aws_lambda_function.wedding.invoke_arn
}

resource "aws_api_gateway_deployment" "wedding" {
	depends_on = [ 
		aws_api_gateway_integration.wedding_api,
	]

	rest_api_id = aws_api_gateway_rest_api.wedding_api.id
	stage_name  = "api"
}

output "base_url" {
	value = aws_api_gateway_deployment.wedding.invoke_url
}
