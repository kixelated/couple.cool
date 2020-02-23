const create = React.createElement

export class Faq extends React.Component {
	render() {
		return create("div", { className: "faq" },
			create("p", {},
				create("div", {}, "Are dogs allowed?"),
				create("div", {}, "We love dogs but they're not allowed in the club house, so it's not recommended. However if you do decide to bring your doggo, there's plenty of open fields and a large dog park within Stern Grove."),
			),
			create("p", {},
				create("div", {}, "Should I bring anything?"),
				create("div", {}, "Bring something warm! It probably won't rain this time of year (fingers crossed) but it's San Francisco in April by the ocean, so don't expect to sun bath. We have rented the club house but it has limited heating."),
			),
			create("p", {},
				create("div", {}, "Can I bring a gift in person?"),
				create("div", {}, "Of course! We set up the ", create("a", { href: "#gifts" }, "gifts page"), " because we thought it would be fun, and because its notoriously to buy a gift for any event, let alone a wedding."),
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
				create("div", {}, "Why are you getting married?"),
				create("div", {}, "Dunno LOL. I'm just kidding, we adore each other and you should come to the wedding and cry with us."),
			),
			create("p", {},
				create("div", {}, "Why did you spend so much time making a custom website?"),
				create("div", {}, "A carpenter would make a hand-crafted table to commemorate the occasion. Meanwhile Luke is a nerd so instead you get a website. Here's the ", create("a", { href: "https://github.com/kixelated/couple.cool" }, "source code"), ".")
			),
			create("p", {},
				create("div", {}, "The website is ugly, maybe you should have consulted somebody with artistic ability?"),
				create("div", {}, "That wasn't a question; get out of my FAQ!")
			),
		)
	}
}
