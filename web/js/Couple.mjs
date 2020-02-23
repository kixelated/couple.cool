const create = React.createElement

export class Couple extends React.Component {
	render() {
		return create("div", { className: "couple" },
			create("p", {}, "In true modern, millennial fasion, we met on the most romantic of platforms - a dating app. It was love at first \"swipe\" 😂. A couple of dates in, we quickly became inseparable and our bond has only continued to grow.We look forward to celebrating with you in the spring!"),
			create("p", {}, "Here are some of the best photos we could find of ourselves. Gawk and gaze."),
			create("div", { className: "polaroids" },
				create("div", { className: "polaroid" },
					create("img", { src: "images/couple2.jpg" }),
					create("p", {}, "On an arduous hiking trip through Portugal"),
				),
				create("div", { className: "polaroid" },
					create("img", { src: "images/couple4.jpg" }),
					create("p", {}, "Preparing a feast in an ancient cave in Crete"),
				),
				create("div", { className: "polaroid" },
					create("img", { src: "images/couple5.jpg" }),
					create("p", {}, "Stalking a bear (or getting stalked) in Alaska"),
				),
				create("div", { className: "polaroid" },
					create("img", { src: "images/couple6.jpg" }),
					create("p", {}, "Looking as unphotogenic as possible in San Francisco"),
				),
				create("div", { className: "polaroid" },
					create("img", { src: "images/couple3-alt.jpg" }),
					create("p", {}, "Pretending to look cool while standing on rocks in front of rocks"),
				),
			),
		)
	}
}
