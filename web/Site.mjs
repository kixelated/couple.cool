import { Home } from "./Home.mjs"
import { Registry } from "./Registry.mjs"

export class Site extends React.Component {
	render() {
		return React.createElement(React.Fragment, null,
			React.createElement(Banner),
			React.createElement("div", { className: "wrapper" }, 
				React.createElement("div", { className: "content" }, 
					React.createElement(Content),
				),
			),
		)
	}
}

class Content extends React.Component {
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
			return React.createElement(Home)
		//} else if (this.state.page === "#couple") {
		} else if (this.state.page === "#registry") {
			return React.createElement(Registry)
		} else {
			return React.createElement("div", { className: "error" }, "Unknown page")
		}
	}
}

class Banner extends React.Component {
	render() {
		return React.createElement("div", { className: "banner" },
			React.createElement("div", { className: "wrapper" }, 
				React.createElement("a", { href: "#home" }, "😎"),
				React.createElement("a", { href: "#couple" }, "Couple"),
				React.createElement("a", { href: "#registry" }, "Registry"),
			),
		)
	}
}
