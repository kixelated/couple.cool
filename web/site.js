class RegistryItem extends React.Component {
	render() {
		return (
			<div className="item">
				<div className="name">{this.props.item.Name.S}</div>
				<div className="cost">${this.props.item.Cost.N}</div>
				<div className="description">{this.props.item.Description.S}</div>
			</div>
		)
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
			<RegistryItem item={item} key={item.Id.N} />
		);

		return (
			<div className="items">
				{items}
			</div>
		);
	}
}

const registry = <Registry />
const container = document.getElementById('registry');

ReactDOM.render(registry, container);
