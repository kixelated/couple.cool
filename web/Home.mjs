const create = React.createElement

export class Home extends React.Component {
	render() {
		return create("div", { className: "home" },
			create("div", { className: "centerpiece" },
				create("div", { className: "names" },
					create("span", { className: "rebe" }, 
						create("img", { className: "bride", src: "images/kixelBride.png" }),
						"Rebe"
					),
					create("span", { className: "plus" }, "+"),
					create("span", { className: "luke" }, 
						"Luke",
						create("img", { className: "fancy", src: "images/kixelFancy.png" }),
					),
				),
				create("div", { className: "cool" }, "😎 the cool couple 😎"),
				create("div", { className: "date" }, "04.25.2020"),
			),
			create("div", { className: "intro" },
				create("p", {}, "So we're getting married. A lifetime of commitment. That's cool I guess."),
				create("p", {}, "We're actually very excited! It's not every day that you get a chance to profess your admiration for another individual in front of friends/family. Plus it's a chance to get said friends/family drunk in REDACTED. So come, celebrate the occasion that is our marriage, and the start of the next phase of our life!"),
				create("p", { style: { textAlign: "center" } }, 
					create("a", { href: "#couple", className: "polaroid" },
						create("img", { src: "images/couple.jpg" }),
					),
				),
				create("p", {}, 
					create(React.Fragment, {},
						"You can ",
						create("a", { href: "#couple" }, "view pictures"),
						" of said cool couple, or perhaps ",
						create("a", { href: "#registry" }, "visit our registry"),
						" and shower us in gifts. So many posibilities!"
					),
				),
			),
		)
	}
}
