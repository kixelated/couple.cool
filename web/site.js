const create = React.createElement;

const PaypalButton = paypal.Buttons.driver("react", { React, ReactDOM })

class BuyFormEmail extends React.Component {
	render() {
		const text = create('span', {}, "Email:")

		const input = create('input', {
			type: 'email',
			value: this.props.value,
			onChange: this.props.onChange,
		})

		return create('div', { className: "email" }, text, input);
	}
}

class BuyForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
		};
	}

	handleEmailChange(e) {
		const email = e.target.value;

		this.setState({
			email: email,
		})
	}

	render() {
		const email = create(BuyFormEmail, {
			value: this.state.email,
			onChange: (e) => { this.setState({ email: e.target.value }) },
		})

		return create('form', {}, email);
	}
}

class Buyer extends React.Component {
	constructor(props) {
		super(props);

		/*
		this.state = {
			buyer: props.buyer,
			step: "SHOW",
		};
		*/
	}

	render() {
		if (!this.props.buyer) return null

		return "Purchased by " + this.props.buyer.S + "!";

		/*
		if (this.state.step == "SHOW") {
			const onClick = (e) => {
				this.setState({ step: "FORM" })
				e.preventDefault()
			}

			return create('a', { href: "#buy", onClick: onClick }, 'Buy')
		}

		if (this.state.step == "FORM") {
			//return create(BuyForm)
		}

		if (this.state.step == "APPROVING") {
			return "Approving the purchase..."
		}

		if (this.state.step == "APPROVED") {
			return "OMG THANKS"
		}
		*/
	}
}

class FullItem extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		if (!this.props.item) return null

		const img = create('img', { src: this.props.item.Image.S })
		const name = create('div', { className: "name" }, this.props.item.Name.S)
		const cost = create('div', { className: "cost" }, "$" + this.props.item.Cost.N)
		const description = create('div', { className: "description" }, this.props.item.Description.S)
		const buyer = create(Buyer, { buyer: this.props.item.Buyer })

		const onClick = (e) => {
			this.props.onDeselect()
			return false
		}

		const paypal = create(PaypalButton, {
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

		const container = create('div', { className: "fullItem" }, img, name, cost, buyer, description, paypal)

		const deselect = create('a', { className: "deselect", href: "#back", onClick: onClick })

		const overlay = create('div', { className: "overlay" }, deselect, container, deselect)

		return overlay
	}
}

class RegistryItem extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const img = create('img', { src: this.props.item.Image.S })
		const name = create('div', { className: "name" }, this.props.item.Name.S)
		const cost = create('div', { className: "cost" }, "$" + this.props.item.Cost.N)

		//const description = create('div', { className: "description" }, this.props.item.Description.S)

		const onClick = (e) => {
			this.props.onSelected(this.props.item)
			return false
		}

		const link = create('a', { href: "#", onClick: onClick }, img, name, cost)

		return create('div', { className: "item" }, link);
	}
}

class Registry extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			items: [],
			selected: null,
		};

		fetch('/items').then((resp) => {
			return resp.json()
		}).then((items) => {
			this.setState({ items: items })
		});
	}

	render() {
		const onSelected = (item) => {
			this.setState({ selected: item })
		}

		const overlay = create(FullItem, {
			item: this.state.selected,
			onDeselect: onSelected,
		})

		const items = this.state.items.map((item) => {
			return create(RegistryItem, {
				item: item,
				key: item.Id.S,
				onSelected: onSelected,
			})
		});

		const itemsContainer = create('div', { className: "items" }, items)

		return create('div', { className: "container" }, overlay, itemsContainer)
	}
}

const registry = create(Registry)
const container = document.getElementById('app')

ReactDOM.render(registry, container)
