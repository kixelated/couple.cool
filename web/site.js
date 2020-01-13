const create = React.createElement;

const PaypalButton = paypal.Buttons.driver("react", { React, ReactDOM })

class Buyer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			buyer: props.buyer,
			step: "SHOW",
		};
	}

	render() {
		if (this.state.buyer) {
			return this.state.buyer.S;
		}

		if (this.state.step == "SHOW") {
			const onClick = (e) => {
				this.setState({ step: "FORM" })
				e.preventDefault()
			}

			return create('a', { href: "#buy", onClick: onClick }, 'Buy')
		}

		if (this.state.step == "FORM") {
			return create(PaypalButton, {
				createOrder: () => {
					return fetch('/create-order', {
						method: 'post',
						headers: {
							'content-type': 'application/json'
						}
					}).then((resp) => {
						return resp.json()
					}).then((data) => {
						return data.orderID
					}).catch((err) => {
						this.setState({ error: err })
					})
				},
				onApprove: (data) => {
					this.setState({ step: "APPROVING" })
					return fetch('/capture-order', {
						method: 'post',
						headers: {
							'content-type': 'application/json',
						},
						body: JSON.stringify({
							orderID: data.orderID,
						})
					}).then((resp) => {
						return resp.json()
					}).then((details) => {
						this.setState({ step: "APPROVED" })
					}).catch((err) => {
						this.setState({ step: "FORM", error: err })
					})
				},
			})
		}

		if (this.state.step == "APPROVING") {
			return "Approving the purchase..."
		}

		if (this.state.step == "APPROVED") {
			return "OMG THANKS"
		}
	}
}

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
		const description = create('div', { className: "description" }, this.props.item.Description.S)
		const buy = create(Buyer, { buyer: this.props.item.Buyer })

		const item = create('div', { className: "item", onClick: this.handleClick }, name, cost, description, buy);

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
		const items = this.state.items.map((item) => {
			return create(RegistryItem, {
				item: item,
				key: item.Id.N,
			})
		});

		return create('div', { className: "items" }, items)
	}
}

const registry = create(Registry)
const container = document.getElementById('registry');

ReactDOM.render(registry, container);
