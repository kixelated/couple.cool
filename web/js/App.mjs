import { Banner } from "./Banner.mjs"
import { Content } from "./Content.mjs"

const create = React.createElement

export class App extends React.Component {
	constructor(props) {
		super(props)

		window.addEventListener("hashchange", () => {
			this.setState({
				page: window.location.hash || "#home"
			})
		})

		this.state = {
			page: window.location.hash || "#home",
		}
	}

	render() {
		return create(React.Fragment, {},
			create(Banner, { page: this.state.page }),
			create(Content, { page: this.state.page }),
		)

	}
}
