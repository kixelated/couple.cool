const create = React.createElement

export class FAQ extends React.Component {
	render() {
		return create("div", { className: "faq" },
			create("p", {},
				create("div", {}, "What time should I arrive?"),
				create("div", {}, "We know it's relatively early but the ceremony will start at 11:15am. Music and mingling will begin a bit before 11am, so feel free to arrive anytime before the ceremony starts."),
			),
			create("p", {},
				create("div", {}, "Is there a dress code? If so, what is it?"),
				create("div", {}, "We want you to be comfortable! That said, this is our wedding, so please no sweat pants or tattered tees (bridezilla moment over, I promise). We recommend cocktail attire or 'smart casual' attire (yes, apparently that is a thing). For further guidance, wear what you'd wear on a date you're not trying to sabotage."),
			),
			create("p", {},
				create("div", {}, "Are dogs allowed?"),
				create("div", {}, "We love dogs but they're not allowed in the club house, so it's not exactly recommended. If you do decide to bring your doggo, we ask that they be well-behaved during the ceremony and if they're having a hard time, to  kindly remove them so as not to disturb others. There are plenty of open fields and a large dog park within Stern Grove."),
			),
			create("p", {},
				create("div", {}, "Should I bring anything?"),
				create("div", {}, "Bring something warm - sweater, jacket, scarf or other layer(s)! It probably won't rain this time of year (fingers crossed) but it's San Francisco in April near the ocean, so don't expect to sun bathe. Typical temperatures range from low 50s to mid 60s and generally foggy. Ceremony will be outdoors and we have rented the Stern Grove Trocadero Clubhouse for the reception but it has limited heating."),
			),
			create("p", {},
				create("div", {}, "Can I bring a gift in person?"),
				create("div", {}, "Of course! We set up the ", create("a", { href: "#gifts" }, "gifts page"), " because we thought it would be fun, and because it's notoriously difficult to buy a gift for any event, let alone a wedding."),
			),
			create("p", {},
				create("div", {}, "How do I get to the venue?"),
				create("div", {}, "Check out the ", create("a", { href: "#venue" }, "venue"), " page for instructions"),
			),
			create("p", {},
				create("div", {}, "Are you going to stream the wedding?"),
				create("div", {}, "Nope; sorry strangers on the internet. We'll take pictures instead!"),
			),
			create("p", {},
				create("div", {}, "May I take a centerpiece home as a souvenir?"),
				create("div", {}, "Yes, feel free to take a glass terrarium and/or wooden centerpiece. They're very pretty and we can't keep them all!"),
			),
			create("p", {},
				create("div", {}, "Why are you getting married?"),
				create("div", {}, "Dunno LOL. Just kidding, we adore each other and you should come to the wedding and cry with us."),
			),
			create("p", {},
				create("div", {}, "Why did you spend so much time making a custom website?"),
				create("div", {}, "A carpenter would make a hand-crafted table to commemorate the occasion. Meanwhile Luke is a nerd so instead you get a website. Here's the ", create("a", { href: "https://github.com/kixelated/couple.cool" }, "source code"), ".")
			),
			create("p", {},
				create("div", {}, "The website is ugly, maybe you should have consulted somebody with artistic ability?"),
				create("div", {}, "That wasn't a question; get out of our FAQ!")
			),
			create("p", {},
				create("div", {}, "I still have questions. Who do I contact?"),
				create("div", {}, "Feel free to email luke@couple.cool or rebe@couple.cool or give us a call, our phone numbers are on the invite."),
			),
		)
	}
}










