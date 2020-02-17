const create = React.createElement

export class Couple extends React.Component {
	render() {
		return create("div", { className: "couple polaroids" },
			create("div", { className: "polaroid" }, 
				create("img", { src: "images/couple2.jpg" }),
				create("div", { className: "name" }, "On an arduous hiking trip through Portugal"),
			),
			create("div", { className: "polaroid" }, 
				create("img", { src: "images/couple4.jpg" }),
				create("div", { className: "name" }, "Preparing a feast in an ancient cave in Crete"),
			),
			create("div", { className: "polaroid" }, 
				create("img", { src: "images/couple5.jpg" }),
				create("div", { className: "name" }, "Stalking a bear (or getting stalked) in Alaska"),
			),
			create("div", { className: "polaroid" }, 
				create("img", { src: "images/couple6.jpg" }),
				create("p", { className: "name" }, "Looking as unphotogenic as possible in San Francisco"),
			),
		)
	}
}
