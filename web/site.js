const create = React.createElement;

class RegistryItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = { toggle: false };
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.setState(state => ({
			toggle: !state.toggle,
		}));
	}

	render() {
		const name = create('div', { className: "name" }, this.props.item.Name.S)
		const cost = create('div', { className: "cost" }, "$" + this.props.item.Cost.N)

		let description;
		if (this.state.toggle) {
			description = create('div', { className: "description" }, this.props.item.Description.S);
		}

		const item = create('div', { className: "item", onClick: this.handleClick }, name, cost, description);

		return item
	}
}

class Registry extends React.Component {
	constructor(props) {
		super(props);
		this.state = { items: [] };

		fetch('/items').then((resp) => {
			return resp.json()
		}).then((items) => {
			this.setState({ items: items })
		});
	}

	render() {
		const items = this.state.items.map((item) =>
			create(RegistryItem, {
				item: item,
				key: item.Id.N,
			})
		);

		return create('div', { className: "items" }, items)
	}
}

const registry = create(Registry)
const container = document.getElementById('registry');

ReactDOM.render(registry, container);
