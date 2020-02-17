export class Home extends React.Component {
	render() {
		return React.createElement("div", { className: "home" },
			React.createElement("div", { className: "centerpiece" },
				React.createElement("div", { className: "names" },
					React.createElement("span", { className: "rebe" }, "Rebe"),
					React.createElement("span", { className: "plus" }, "+"),
					React.createElement("span", { className: "luke" }, "Luke"),
				),
				React.createElement("div", { className: "cool" }, "😎 the cool couple 😎"),
				React.createElement("div", { className: "date" }, "04.25.2020"),
			),
			React.createElement("div", { className: "intro" },
				React.createElement("p", {}, "So we're getting married. A lifetime of commitment. That's cool I guess."),
				React.createElement("p", {}, "We're actually very excited! It's not every day that you get a chance to profess your admiration for another individual in front of friends/family. Plus it's a chance to get said friends/family drunk in a park. So come, celebrate the occasion that is our marriage, and the start of the next phase of our life!"),
				React.createElement("p", {}, "You can view pictures of said cool couple, or perhaps visit our registry and shower us in gifts. So many posibilities!"),
			),
		)
	}
}
