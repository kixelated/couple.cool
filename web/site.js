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

		if (this.props.item.BuyerName) {
			return create('div', { className: "buyer" }, "Already purchased; go find something else!")
		}

		if (this.state.phase == "paypal")  {
			const paypal = create(PaypalButton, {
				className: "pal",
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
						this.props.item.BuyerName = { S: "Anonymous" }
					} catch (err) {
						console.error(err)
						this.setState({ error: err })
					}
				},
			})

			const goBack = (e) => {
				this.setState({ phase: "form" })
			}

			const back = create("button", { type: "button", onClick: goBack }, "Back")

			return create("div", { className: "pay" }, paypal, back)
		}

		const goNext = (e) => {
			e.preventDefault()
			this.setState({ phase: "paypal" })
		}

		return create('form', { onSubmit: goNext, className: "form" },
			create('label', {}, "Name:"),
			create('input', {
				type: 'text',
				value: this.state.name,
				onChange: (e) => { this.setState({ name: e.target.value }) },
				required: true,
				spellCheck: false,
			}),
			create('label', {}, "Email:"),
			create('input', {
				type: 'email',
				value: this.state.email,
				onChange: (e) => { this.setState({ email: e.target.value }) },
				required: true,
			}),
			create('label', {}, "Message:"),
			create('textarea', {
				value: this.state.message,
				onChange: (e) => { this.setState({ message: e.target.value }) },
				placeholder: 'Leave a message for the "happy" couple!',
				spellCheck: true,
				required: true,
			}),
			create("input", { type: "submit", value: "Next" }),
		)
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


		const onClick = (e) => {
			this.props.onDeselect()
			e.preventDefault()
		}

		const header = create('div', { className: "header" }, 
			create('img', { src: this.props.item.Image.S }),
			create('div', { className: "info" }, 
				create('div', { className: "name" }, this.props.item.Name.S),
				create('div', { className: "cost" }, this.props.item.CostDisplay.S),
				create('p', { className: "description" }, this.props.item.Description.S),
			),
		)

		const border = create('div', { className: "border" })

		const body = create('div', { className: "body" }, 
			create(BuyForm, { item: this.props.item }),
		)

		const container = create('div', { className: "fullItem" }, header, border, body)
		const deselect = create('a', { className: "deselect", href: "#back", onClick: onClick })

		const overlay = create('div', { className: "overlay" }, deselect, container, deselect)

		return overlay
	}
}

class RegistryItemPrice extends React.Component {
	render() {
		if (!this.props.item.BuyerName) {
			return create('div', { className: "cost"}, this.props.item.CostDisplay.S)
		}

		return create('div', { className: "buyer" }, "TAKEN!")
	}
}

class RegistryItem extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		const setSelected = (e) => {
			this.props.setSelected(this.props.item)
			e.preventDefault()
		}

		return create('div', { className: "item" },
			create('a', { href: "#", onClick: setSelected },
				create('img', { src: "images/" + this.props.item.Image.S }),
				create('div', { className: "name" }, this.props.item.Name.S),
				create(RegistryItemPrice, { item: this.props.item })
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
		})

		const itemsContainer = create('div', { className: "items" }, items)

		return create('div', { className: "container" }, overlay, itemsContainer)
	}
}

const registry = create(Registry)
const container = document.getElementById('app')

ReactDOM.render(registry, container)
