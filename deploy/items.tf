resource "aws_dynamodb_table_item" "items" {
	table_name = aws_dynamodb_table.items.name
  	hash_key   = aws_dynamodb_table.items.hash_key

	for_each = {
		sausage = <<ITEM
		{
			"Id": { "S": "sausage" },
			"Name": { "S": "Penny Treats" },
			"Description": { "S": "Yaaaay" },
			"Cost": { "N": "10" },
			"CostDisplay": { "S": "$10" },
			"Image": { "S": "sausage.png" }
		}
ITEM

	camera = <<ITEM
		{
			"Id": { "S": "camera" },
			"Name": { "S": "Digital Camera" },
			"Description": { "S": "Cell phone cameras are cool but 'professional' cameras are even cooler." },
			"Cost": { "N": "800" },
			"CostDisplay": { "S": "$800" },
			"Image": { "S": "camera.png" }
		}
ITEM

	pet = <<ITEM
		{
			"Id": { "S": "pet" },
			"Name": { "S": "Adopt" },
			"Description": { "S": "Dogo or cato?" },
			"Cost": { "N": "5000" },
			"CostDisplay": { "S": "$5000" },
			"Image": { "S": "pet.png" }
		}
ITEM

	bear = <<ITEM
		{
			"Id": { "S": "bear" },
			"Name": { "S": "Cute Bear" },
			"Description": { "S": "Picture of a cute (and cheap!) bear" },
			"Cost": { "N": "1" },
			"CostDisplay": { "S": "$0.99" },
			"Image": { "S": "bear.png" }
		}
ITEM

	sausage2 = <<ITEM
		{
			"Id": { "S": "sausage2" },
			"Name": { "S": "Buy Penny" },
			"Description": { "S": "yaaay penny" },
			"Cost": { "N": "4000" },
			"CostDisplay": { "S": "$4000" },
			"Image": { "S": "sausage2.png" }
		}
ITEM

	lolo = <<ITEM
		{
			"Id": { "S": "lolo" },
			"Name": { "S": "Treats for Lolo" },
			"Description": { "S": "Lolo loves food" },
			"Cost": { "N": "20" },
			"CostDisplay": { "S": "$20" },
			"Image": { "S": "lolo.png" }
		}
ITEM

	sausage3 = <<ITEM
		{
			"Id": { "S": "sausage3" },
			"Name": { "S": "Steal Penny" },
			"Description": { "S": "Screw this lets just steal penny." },
			"Cost": { "N": "50" },
			"CostDisplay": { "S": "$50" },
			"Image": { "S": "sausage3.png" }
		}
ITEM

	foxy = <<ITEM
		{
			"Id": { "S": "foxy" },
			"Name": { "S": "Steal Foxy" },
			"Description": { "S": "Or steal foxy." },
			"Cost": { "N": "8000" },
			"CostDisplay": { "S": "$8000" },
			"Image": { "S": "foxy.png" }
		}
ITEM

	classy = <<ITEM
		{
			"Id": { "S": "classy" },
			"Name": { "S": "Cheap Wine" },
			"Description": { "S": "We don't like wine so this will go towards the cheapest option" },
			"Cost": { "N": "5" },
			"CostDisplay": { "S": "$4.99" },
			"Image": { "S": "classy.png" }
		}
ITEM
	}

 	item = each.value
}
