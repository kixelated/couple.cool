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

		this.state = {
			page: window.location.hash || "#home",
			items: [],
		}

		fetch('/api/items').then((resp) => {
			return resp.json()
		}).then((items) => {
			this.setState({ items: items })
		})
	}

	render() {
		let content

		if (this.state.page === "#home") {
			return React.createElement(Home)
		} else if (this.state.page === "#photos") {
			return React.createElement(Photos)
		} else if (this.state.page === "#gifts") {
			return React.createElement(Registry, { items: this.state.items })
		} else {
			return React.createElement("div", { className: "error" }, "Unknown page")
		}
	}
}
