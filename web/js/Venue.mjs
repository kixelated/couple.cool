const create = React.createElement

export class Venue extends React.Component {
	render() {
		return create("div", { className: "venue" },
			create("p", {}, "We're getting married in Stern Grove, a beautiful park in San Francisco. We've rented out the Stern Grove Trocadero clubhouse in this sweet park by the ocean. Don't forget to bring your sweater!"),
			create("div", { className: "polaroids" }, 
				create("div", { className: "polaroid" }, 
					create("img", { src: "images/stern2.jpg" }),
					create("p", {}, "STERN GROVE"),
				),
				create("div", { className: "polaroid" }, 
					create("img", { src: "images/stern3.jpg" }),
					create("p", {}, "also STERN GROVE"),
				),
				create("div", { className: "polaroid" },
					create("img", { src: "images/stern.jpg" }),
					create("p", {}, "THE SPOT"),
				),
			),
		)
	}
}
