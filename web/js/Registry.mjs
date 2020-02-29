const create = React.createElement;
const PaypalButton = paypal.Buttons.driver("react", { React, ReactDOM })

export class Registry extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: null,
		}
	}

	render() {
		const setSelected = (item) => {
			this.setState({ selected: item })
		}

		const overlay = create(RegistryFullItem, {
			item: this.state.selected,
			onDeselect: setSelected,
		})

		const items = this.props.items.map((item) => {
			return create(RegistryItem, {
				item: item,
				key: item.Id.S,
				setSelected: setSelected,
			})
		})

		return create('div', { className: "registry" },
			overlay,
			create('p', {}, "Welcome to the gift shoppe!"),
			create('p', {}, "You can pay for one of the below items/experiences and we'll send you a personalized photo once we buy it. Remember, you can always bring a gift in person instead."),
			create('div', { className: "items polaroids" }, items),
		)
	}
}

class RegistryBuyForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			cost: this.props.item.Cost.N,
			name: "",
			email: "",
			message: "",
			phase: "form",
		}
	}

	render() {
		if (this.state.error) {
			const goBack = (e) => {
				this.setState({ error: "" })
			}

			return create("div", {},
				create("p", { className: "error" }, "error: " + JSON.stringify(this.state.error)),
				create("button", { type: "button", onClick: goBack }, "Back"),
			)
		}

		if (this.state.phase == "approving" ) {
			return create("p", {}, "Please wait...")
		}

		if (this.state.phase == "approved" ) {
			const goBack = (e) => {
				e.preventDefault()
				this.props.onDeselect()
			}

			return create("div", {},
				create("p", {}, "THANK YOU SO MUCH!"),
				create("p", {}, "We appreciate the gift and hopefully we'll see you at our wedding!"),
				create("button", { type: "button", onClick: goBack }, "Back"),
			)
		}

		if (this.props.item.Sold) {
			return create('div', { className: "buyer" }, "Already purchased; go find something else!")
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
								value: this.state.cost,
								breakdown: {
									item_total: {
										currency_code: 'USD',
										value: this.state.cost,
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
									value: this.state.cost,
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
						const res = await fetch('/api/purchase', {
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
								cost: this.state.cost,
							}),
						})

						const info = await res.json();
						if (info.error) {
							throw info.error
						}

						this.setState({ phase: "approved" })

						if (this.props.item.Cost.N > 0) {
							this.props.item.Sold = { BOOL: true }
						}
					} catch (err) {
						console.error(err)
						this.setState({ error: err })
					}
				},
			})

			const goBack = (e) => {
				this.setState({ phase: "form" })
			}

			return create("div", { className: "pay" },
				create("p", {}, "Click on one of the PayPal buttons to complete the purchase:"),
				create("div", { className: "pal" }, paypal),
				create("button", { type: "button", onClick: goBack }, "Back"),
			)
		}

		const goNext = (e) => {
			e.preventDefault()

			if (this.state.cost >= 1) {
				this.setState({ phase: "paypal" })
			} else {
				this.setState({ error: "Enter an amount greater than $1" })
			}
		}

		const goBack = (e) => {
			this.props.onDeselect()
			e.preventDefault()
		}

		const onCost = (e) => {
			let cost = e.target.value
			if (cost.startsWith("$")) {
				cost = cost.substr(1)
			}

			cost = parseInt(cost)
			if (isNaN(cost)) {
				cost = 0
			}

			this.setState({ cost: cost })
		}

		return create("div", {},
			create("p", {}, "Enter your details if you want to buy this item for us. We'll send you a personalized picture when the purchase is done."),
			create('form', { onSubmit: goNext, className: "form" },
				create('label', {}, "Amount:"),
				create('input', {
					type: 'text',
					value: "$" + this.state.cost,
					onChange: onCost,
					disabled: this.props.item.Cost.N > 0,
				}),
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
					rows: 4,
					value: this.state.message,
					onChange: (e) => { this.setState({ message: e.target.value }) },
					placeholder: 'Leave a message for the "happy" couple!',
					spellCheck: true,
					required: true,
				}),
				create("button", { type: "button", onClick: goBack }, "Back"),
				create("input", { type: "submit", value: "Next" }),
			),
		)
	}
}

class RegistryFullItem extends React.Component {
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

		const container = create('div', { className: "fullItem" },
			create('div', { className: "header" },
				create('img', { src: "images/" + this.props.item.Image.S }),
				create('div', { className: "info" },
					create('div', { className: "name" }, this.props.item.Name.S),
					create('div', { className: "cost" }, this.props.item.Cost.N > 0 ? this.props.item.CostDisplay.S : ""),
					create('p', { className: "description" }, this.props.item.Description.S),
				),
			),
			create('div', { className: "body" },
				create(RegistryBuyForm, {
					item: this.props.item,
					onDeselect: this.props.onDeselect,
				}),
			),
		)

		const deselect = create('a', { className: "deselect", href: "#back", onClick: onClick })
		return create('div', { className: "overlay" }, deselect, container, deselect)
	}
}

class RegistryItemPrice extends React.Component {
	render() {
		if (!this.props.item.Sold) {
			return create('div', { className: "cost"}, this.props.item.CostDisplay.S)
		}

		return create('div', { className: "buyer" }, "TAKEN!")
	}
}

class RegistryItem extends React.Component {
	render() {
		const setSelected = (e) => {
			this.props.setSelected(this.props.item)
			e.preventDefault()
		}

		return create('a', { className: "polaroid", href: "#", onClick: setSelected },
			create('img', { src: "images/" + this.props.item.Image.S }),
			create('div', { className: "name" }, this.props.item.Name.S),
			create(RegistryItemPrice, { item: this.props.item })
		)
	}
}
