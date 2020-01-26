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

	setError(err) {
		this.setState({ error: err })
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
				createOrder: () => {
					return fetch('/create-order', {
						method: 'post',
						headers: {
							'content-type': 'application/json'
						},
						body: JSON.stringify({
							item: this.props.item,
							email: this.state.email, // just to auto-populate paypal
						})
					}).then((resp) => {
						return resp.json()
					}).then((data) => {
						if (data.error) {
							throw data.error
						}

						return data.orderID
					}).catch(this.setError.bind(this))
				},
				onApprove: (data) => {
					this.setState({ phase: "approving" })

					return fetch('/capture-order', {
						method: 'post',
						headers: {
							'content-type': 'application/json',
						},
						body: JSON.stringify({
							orderID: data.orderID,
							item: this.state.item,
							name: this.state.name,
							email: this.state.email,
							message: this.state.message,
						})
					}).then((resp) => {
						return resp.json()
					}).then((details) => {
						console.log(details)
						if (data.error) {
							throw data.error
						}

						this.setState({ phase: "approved" })
					}).catch(this.setError.bind(this))
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
			placeholder: 'A message for the "happy" couple!',
			spellCheck: true,
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

		const form = create(BuyForm, { item: this.props.item.Id.S })

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
