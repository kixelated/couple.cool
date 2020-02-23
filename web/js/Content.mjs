import { Home } from "./Home.mjs"
import { Couple } from "./Couple.mjs"
import { Registry } from "./Registry.mjs"
import { Venue } from "./Venue.mjs"
import { Faq } from "./Faq.mjs"

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
		} else if (this.state.page === "#couple") {
			return React.createElement(Couple)
		} else if (this.state.page === "#gifts") {
			return React.createElement(Registry, { items: this.state.items })
		} else if (this.state.page === "#venue") {
			return React.createElement(Venue)
		} else if (this.state.page === "#faq") {
			return React.createElement(Faq)
		} else {
			return React.createElement("div", { className: "error" }, "Unknown page")
		}
	}
}
