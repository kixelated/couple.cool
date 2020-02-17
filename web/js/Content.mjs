import { Home } from "./Home.mjs"
import { Photos } from "./Photos.mjs"
import { Registry } from "./Registry.mjs"

export class Content extends React.Component {
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
		} else if (this.state.page === "#photos") {
			return React.createElement(Photos)
		} else if (this.state.page === "#registry") {
			return React.createElement(Registry)
		} else {
			return React.createElement("div", { className: "error" }, "Unknown page")
		}
	}
}
