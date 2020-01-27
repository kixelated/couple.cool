const create = React.createElement;

const PaypalButton = paypal.Buttons.driver("react", { React, ReactDOM })


class BuyForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			name: "",
			email: "",
			message: "",
			phase: "form",
		}
	}

	setName(e) {
		this.setState({ name: e.target.value })
	}

	setEmail(e) {
		this.setState({ email: e.target.value })
	}

	setMessage(e) {
		this.setState({ message: e.target.value })
	}

	goNext(e) {
		e.preventDefault()
		this.setState({ phase: "paypal" })
	}

	goBack(e) {
		this.setState({ phase: "form" })
	}

	render() {
		if (this.state.error) {
			return create("p", {}, "Error: " + this.state.error)
		}

		if (this.state.phase == "approving" ) {
			return create("p", {}, "Please wait...")
		}

		if (this.state.phase == "approved" ) {
			return create("p", {}, "THANKS!")
		}

		if (this.state.phase == "paypal")  {
			const paypal = create(PaypalButton, {
				createOrder: (data, actions) => {
					return actions.order.create({
						intent: "CAPTURE",
						payer: {
							email_address: this.state.email,
						},
						purchase_units: [{
							amount: {
								currency_code: 'USD',
								value: this.props.item.Cost.N,
								breakdown: {
									item_total: {
										currency_code: 'USD',
										value: this.props.item.Cost.N,
									},
								},
							},
							description: "Luke & Rebecca's wedding registry",
							soft_descriptor: "L&R Wedding",
							custom_id: this.props.item.Id.S,
							items: [{
								name: this.props.item.Name.S,
								unit_amount: {
									currency_code: 'USD',
									value: this.props.item.Cost.N,
								},
								quantity: '1',
								description: this.props.item.Description.S,
								category: "DIGITAL_GOODS",
							}],
						}],
						application_context: {
							brand_name: "Luke & Rebecca Wedding Registry",
							shipping_preference: "NO_SHIPPING",
							user_action: "PAY_NOW",
						},
					}).catch((err) => {
						console.error(err)
						this.setState({ error: err })
					})
				},
				onApprove: async (data) => {
					this.setState({ phase: "approving" })

					try {
						const res = await fetch('/purchase', {
							method: 'post',
							headers: {
								'content-type': 'application/json',
							},
							body: JSON.stringify({
								orderID: data.orderID,
								itemID: this.props.item.Id.S,

								name: this.state.name,
								email: this.state.email,
								message: this.state.message,
							}),
						})

						const info = await res.json();
						if (info.error) {
							throw info.error
						}

						this.setState({ phase: "approved" })
					} catch (err) {
						console.error(err)
						this.setState({ error: err })
					}
				},
			})

			const back = create("button", { onClick: this.goBack.bind(this) }, "Back")

			return create("div", {}, paypal, back)
		}

		const name = create(BuyFormName, {
			value: this.state.name,
			onChange: this.setName.bind(this),
		})

		const email = create(BuyFormEmail, {
			value: this.state.email,
			onChange: this.setEmail.bind(this),
		})

		const message = create(BuyFormMessage, {
			value: this.state.message,
			onChange: this.setMessage.bind(this),
		})

		const next = create("input", { type: "submit", value: "Next" })

		return create('form', { onSubmit: this.goNext.bind(this) }, name, email, message, next);
	}
}

class BuyFormName extends React.Component {
	render() {
		const text = create('span', {}, "Name:")

		const input = create('input', {
			type: 'text',
			value: this.props.value,
			onChange: this.props.onChange,
			required: true,
			spellCheck: false,
		})

		return create('div', { className: "name" }, text, input);
	}
}

class BuyFormEmail extends React.Component {
	render() {
		const text = create('span', {}, "Email:")

		const input = create('input', {
			type: 'email',
			value: this.props.value,
			onChange: this.props.onChange,
			required: true,
		})

		return create('div', { className: "email" }, text, input);
	}
}

class BuyFormMessage extends React.Component {
	render() {
		const text = create('span', {}, "Message:")

		const input = create('textarea', {
			value: this.props.value,
			onChange: this.props.onChange,
			placeholder: 'Leave a message for the "happy" couple!',
			spellCheck: true,
			required: true,
		})

		return create('div', { className: "message" }, text, input);
	}
}

class FullItem extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		if (!this.props.item) {
			return null
		}

		const img = create('img', { src: this.props.item.Image.S })

		const name = create('div', { className: "name" }, this.props.item.Name.S)
		const cost = create('div', { className: "cost" }, "$" + this.props.item.Cost.N)
		const description = create('p', { className: "description" }, this.props.item.Description.S)

		const info = create('div', { className: "info" }, name, cost, description)

		const onClick = (e) => {
			this.props.onDeselect()
			e.preventDefault()
		}

		const form = create(BuyForm, { item: this.props.item })

		const header = create('div', { className: "header" }, img, info)
		const body = create('div', { className: "body" }, form)

		const container = create('div', { className: "fullItem" }, header, body)
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
		const setSelected = (e) => {
			this.props.setSelected(this.props.item)
			e.preventDefault()
		}

		return create('div', { className: "item" },
			create('a', { href: "#", onClick: setSelected },
				create('img', { src: this.props.item.Image.S }),
				create('div', { className: "name" }, this.props.item.Name.S),
				create('div', { className: "cost" }, "$" + this.props.item.Cost.N),
			),
		)
	}
}

class Registry extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			items: [],
			selected: null,
		}

		fetch('/items').then((resp) => {
			return resp.json()
		}).then((items) => {
			this.setState({ items: items })
		})
	}

	render() {
		const setSelected = (item) => {
			this.setState({ selected: item })
		}

		const overlay = create(FullItem, {
			item: this.state.selected,
			onDeselect: setSelected,
		})

		const items = this.state.items.map((item) => {
			return create(RegistryItem, {
				item: item,
				key: item.Id.S,
				setSelected: setSelected,
			})
		});

		const itemsContainer = create('div', { className: "items" }, items)

		return create('div', { className: "container" }, overlay, itemsContainer)
	}
}

const registry = create(Registry)
const container = document.getElementById('app')

ReactDOM.render(registry, container)
