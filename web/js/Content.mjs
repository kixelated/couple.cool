import { Home } from "./Home.mjs"
import { Couple } from "./Couple.mjs"
import { Registry } from "./Registry.mjs"
import { Venue } from "./Venue.mjs"
import { FAQ } from "./FAQ.mjs"
import { RSVP } from "./RSVP.mjs"

const create = React.createElement

export class Content extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			items: [],
		}

		fetch('/api/items').then((resp) => {
			return resp.json()
		}).then((items) => {
			this.setState({ items: items })
		})
	}

	render() {
		return create("div", { className: "wrapper" }, 
			create("div", { className: "content" },
				this.renderInner(),
			),
		)
	}

	renderInner() {
		if (this.props.page === "#home") {
			return create(Home)
		} else if (this.props.page === "#couple") {
			return create(Couple)
		} else if (this.props.page === "#gifts") {
			return create(Registry, { items: this.state.items })
		} else if (this.props.page === "#venue") {
			return create(Venue)
		} else if (this.props.page === "#faq") {
			return create(FAQ)
		} else if (this.props.page === "#rsvp") {
			return create(RSVP)
		} else {
			return create("div", { className: "error" }, "Unknown page")
		}
	}
}
