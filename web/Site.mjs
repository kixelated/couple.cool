import { Home } from "./Home.mjs"
import { Registry } from "./Registry.mjs"

export class Site extends React.Component {
	constructor(props) {
		super(props)

		window.addEventListener("hashchange", () => {
			this.setState({
				page: window.location.hash || "#home"
			})
		})

		this.state = { page: window.location.hash || "#home" }
	}

	render() {
		let content
		if (this.state.page === "#home") {
			content = React.createElement(Home)
		//} else if (this.state.page === "#couple") {
		} else if (this.state.page === "#registry") {
			content = React.createElement(Registry)
		} else {
			content = React.createElement("div", { className: "error" }, "Unknown page")
		}

		return React.createElement(React.Fragment, null,
			React.createElement(Banner),
			React.createElement("div", { className: "content" }, content),
		)
	}
}

class Banner extends React.Component {
	render() {
		return React.createElement("div", { className: "banner" },
			React.createElement("div", { className: "logo" },
				React.createElement("a", { href: "#home" }, "😎"),
			),
			React.createElement("div", { className: "wrapper" },
				React.createElement("a", { href: "#couple" }, "Couple"),
				React.createElement("a", { href: "#registry" }, "Registry"),
			),
		)
	}
}
