const create = React.createElement

export class Banner extends React.Component {
	render() {
		const isSelected = (page) => {
			return (this.props.page === page) ? "selected" : "deselected"
		}

		return create("div", { className: "banner" },
			create("div", { className: "wrapper" },
				create("a", { className: isSelected("#home"), href: "#home" }, "😎"),
				create("a", { className: isSelected("#couple"), href: "#couple" }, "Couple"),
				create("a", { className: isSelected("#venue"), href: "#venue" }, "Venue"),
				create("a", { className: isSelected("#schedule"), href: "#schedule" }, "Schedule"),
				create("a", { className: isSelected("#faq"), href: "#faq" }, "FAQ"),
				create("a", { className: isSelected("#rsvp"), href: "#rsvp" }, "RSVP"),
				create("a", { className: isSelected("#gifts"), href: "#gifts" }, "Gifts"),
			),
		)
	}
}
