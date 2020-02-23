resource "aws_dynamodb_table" "items" {
	name           = "registry.items"
	billing_mode   = "PROVISIONED"
	write_capacity = 1
	read_capacity  = 5

	hash_key = "Id"

	attribute {
	    name = "Id"
	    type = "S"
	}
}

resource "aws_dynamodb_table_item" "items" {
	table_name = aws_dynamodb_table.items.name
  	hash_key   = aws_dynamodb_table.items.hash_key

	for_each = {
		boulder = <<ITEM
		{
			"Id": { "S": "boulder" },
			"Name": { "S": "Bouldering Session" },
			"Description": { "S": "Help us get swol 💪 and climb to new heights at Dogpatch Boulder. The extra dollar is for chaulk because the pros do it." },
			"Cost": { "N": "51" },
			"CostDisplay": { "S": "$51" },
			"Image": { "S": "rock.jpg" }
		}
ITEM

		camera = <<ITEM
		{
			"Id": { "S": "camera" },
			"Name": { "S": "Digital Camera" },
			"Description": { "S": "Cell phone cameras are cool but 'professional' cameras are even cooler. They let you manually focus!" },
			"Cost": { "N": "800" },
			"CostDisplay": { "S": "$800" },
			"Image": { "S": "camera.png" }
		}
ITEM

		hamilton = <<ITEM
		{
			"Id": { "S": "Hamilton" },
			"Name": { "S": "Hamilton Tickets" },
			"Description": { "S": "We've been wanting to see Hamilton for awhile now! It's showing in SF until end of May, so why not?" },
			"Cost": { "N": "310" },
			"CostDisplay": { "S": "$310" },
			"Image": { "S": "hamilton.jpg" }
		}
ITEM

		woods = <<ITEM
		{
			"Id": { "S": "woods" },
			"Name": { "S": "Weekend in the Woods" },
			"Description": { "S": "Let's escape to the woods for a long weekend. Rebe has always wanted to visit Lassen Volcanic National Park!" },
			"Cost": { "N": "300" },
			"CostDisplay": { "S": "$300" },
			"Image": { "S": "cabin.jpg" }
		}
ITEM

		icecream = <<ITEM
		{
			"Id": { "S": "icecream" },
			"Name": { "S": "Pint of Ice Cream" },
			"Description": { "S": "What better way to de-stress post-wedding than indulging in oh-so-delicious ice cream? Rebe eats it right out of the carton." },
			"Cost": { "N": "7" },
			"CostDisplay": { "S": "$7" },
			"Image": { "S": "icecream.jpg" }
		}
ITEM

		hotel = <<ITEM
		{
			"Id": { "S": "hotel" },
			"Name": { "S": "One Night in Tokyo" },
			"Description": { "S": "We need a place to stay while staying in the land of anime. The picture is from TwitchCon in San Diego but close enough." },
			"Cost": { "N": "150" },
			"CostDisplay": { "S": "¥17000" },
			"Image": { "S": "hotel.jpg" }
		}
ITEM

		toaster = <<ITEM
		{
			"Id": { "S": "toaster" },
			"Name": { "S": "Toaster Oven" },
			"Description": { "S": "I guess we should have at least one typical registry item on here. Life is depressing without a means to produce toast." },
			"Cost": { "N": "50" },
			"CostDisplay": { "S": "$50" },
			"Image": { "S": "toaster.jpg" }
		}
ITEM

		dinner = <<ITEM
		{
			"Id": { "S": "dinner" },
			"Name": { "S": "Romantic Dinner" },
			"Description": { "S": "Romantic dinner para dos on our honeymoon." },
			"Cost": { "N": "100" },
			"CostDisplay": { "S": "¥11000" },
			"Image": { "S": "dinner.jpg" }
		}
ITEM

		preggo = <<ITEM
		{
			"Id": { "S": "preggo" },
			"Name": { "S": "Pregnancy Test" },
			"Description": { "S": "'Oops'" },
			"Cost": { "N": "15" },
			"CostDisplay": { "S": "why??" },
			"Image": { "S": "pants.jpg" }
		}
ITEM

		donate = <<ITEM
		{
			"Id": { "S": "donate" },
			"Name": { "S": "Donate" },
			"Description": { "S": "Doctors without Borders provides lifesaving medical humanitarian care in some of the world's most dangerous and inaccessible areas. Donate to them instead of us!" },
			"Cost": { "N": "0" },
			"CostDisplay": { "S": "custom amount" },
			"Image": { "S": "donate.png" }
		}
ITEM

		matress = <<ITEM
		{
			"Id": { "S": "matress" },
			"Name": { "S": "King Sized Mattress" },
			"Description": { "S": "Because rebe takes up all of the space on the bed." },
			"Cost": { "N": "500" },
			"CostDisplay": { "S": "$500" },
			"Image": { "S": "bed.jpg" }
		}
ITEM

		boba = <<ITEM
		{
			"Id": { "S": "boba" },
			"Name": { "S": "BOBA" },
			"Description": { "S": "Rebe loves BOBA. Well actually, only a specific 'Taro Lover' flavor, but close enough." },
			"Cost": { "N": "5" },
			"CostDisplay": { "S": "$5" },
			"Image": { "S": "taro.jpg" }
		}
ITEM

		museum = <<ITEM
		{
			"Id": { "S": "museum" },
			"Name": { "S": "Museum Tickets" },
			"Description": { "S": "Entrance fee to a museum in Japon during our honeymoon. Let's get cultured!" },
			"Cost": { "N": "40" },
			"CostDisplay": { "S": "$40" },
			"Image": { "S": "museum.jpg" }
		}
ITEM

		wallart = <<ITEM
		{
			"Id": { "S": "wallart" },
			"Name": { "S": "Tasteful Wall Art" },
			"Description": { "S": "The walls are barren. We need more pictures of clownfish to adorn the walls. You're our only hope!" },
			"Cost": { "N": "75" },
			"CostDisplay": { "S": "$75" },
			"Image": { "S": "art.jpg" }
		}
ITEM

		karaoke = <<ITEM
		{
			"Id": { "S": "karaoke" },
			"Name": { "S": "Night of Karaoke and Sake" },
			"Description": { "S": "Rebe loves singing and Luke loves having a hazy recollection of what happened last night." },
			"Cost": { "N": "100" },
			"CostDisplay": { "S": "$100" },
			"Image": { "S": "karaoke.jpg" }
		}
ITEM

		club = <<ITEM
		{
			"Id": { "S": "club" },
			"Name": { "S": "Club" },
			"Description": { "S": "You could find us in the club, bottle full of bub." },
			"Cost": { "N": "75" },
			"CostDisplay": { "S": "$75" },
			"Image": { "S": "club.jpg" }
		}
ITEM

		kixelcat = <<ITEM
		{
			"Id": { "S": "kixelcat" },
			"Name": { "S": "Kustom KixelCat" },
			"Description": { "S": "Luke makes \"art\". You can commision your own variation of this iconic cat-like thing." },
			"Cost": { "N": "30" },
			"CostDisplay": { "S": "$30" },
			"Image": { "S": "kixelBride.png" }
		}
ITEM

		gaming = <<ITEM
		{
			"Id": { "S": "gaming" },
			"Name": { "S": "Upgrade Gaming PC" },
			"Description": { "S": "Luke has an average gaming computer. That's no good. It needs more LEDs (and a faster CPU)!" },
			"Cost": { "N": "350" },
			"CostDisplay": { "S": "$350" },
			"Image": { "S": "gaming.jpg" }
		}
ITEM

		puka = <<ITEM
		{
			"Id": { "S": "puka" },
			"Name": { "S": "PUKA PUNCH" },
			"Description": { "S": "Our notoriously strong tiki bevarage of choice!" },
			"Cost": { "N": "20" },
			"CostDisplay": { "S": "$20" },
			"Image": { "S": "puka.jpg" }
		}
ITEM

		puka = <<ITEM
		{
			"Id": { "S": "weed" },
			"Name": { "S": "Dank Weed" },
			"Description": { "S": "We rarely partake but there's a new dispensary on our street. Plus look at that dank picture." },
			"Cost": { "N": "42" },
			"CostDisplay": { "S": "$42.0" },
			"Image": { "S": "weed.jpg" }
		}
ITEM

		dota = <<ITEM
		{
			"Id": { "S": "dota" },
			"Name": { "S": "Office Dota" },
			"Description": { "S": "Pay me and I'll play a daed gaem with you. mid and feed." },
			"Cost": { "N": "10" },
			"CostDisplay": { "S": "$10" },
			"Image": { "S": "hike.jpg" }
		}
ITEM

		cash = <<ITEM
		{
			"Id": { "S": "cash" },
			"Name": { "S": "Cold Hard Cash" },
			"Description": { "S": "Feeling particularly like a free-market capitalist today? You could give us any number of slips of paper that can be exchanged for goods." },
			"Cost": { "N": "0" },
			"CostDisplay": { "S": "custom" },
			"Image": { "S": "classy.png" }
		}
ITEM

		huey = <<ITEM
		{
			"Id": { "S": "huey" },
			"Name": { "S": "Treats for Huey" },
			"Description": { "S": "We dog-sit a cutie every week. Huey is always hungry." },
			"Cost": { "N": "5" },
			"CostDisplay": { "S": "$5" },
			"Image": { "S": "huey.jpg" }
		}
ITEM
	}

 	item = each.value
}
