const create = React.createElement;

export class RSVP extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			code: "",
			email: "",
			name: "",
			guests: 0,
			message: "",
			coming: "yes",
		}
	}

	render() {
		if (this.state.done) {
			if (this.state.coming === "yes") {
				return create("p", {}, "Thank you! We're looking forward to seeing you on the fateful day! Don't forget to check out ", create("a", { href: "#gifts" }, "our registry"), " if you haven't already. 😉")
			} else {
				return create("p", {}, "Oh no! Sorry you can't make it; you will be missed.")
			}
		}

		if (this.state.error) {
			const tryAgain = (e) => {
				this.setState({ error: "" })
			}

			return create("div", {},
				create("p", { className: "error" }, "error: " + JSON.stringify(this.state.error)),
				create("button", { type: "button", onClick: tryAgain }, "Try Again"),
			)
		}

		const submit = async () => {
			try {
				const res = await fetch('/api/rsvp', {
					method: 'post',
					headers: {
						'content-type': 'application/json',
					},
					body: JSON.stringify({
						code: this.state.code,
						email: this.state.email,
						name: this.state.name,
						guests: this.state.guests,
						message: this.state.message,
						coming: this.state.coming,
					}),
				})

				const info = await res.json()
				if (info.error) {
					throw info.error
				}

				this.setState({ done: true })
			} catch(e) {
				this.setState({ error: e })
			}
		}

		return create('div', { className: "rsvp" }, 
			create('p', {}, "Let us know if you're coming! Check your email for the invite code."),
			create('form', { onSubmit: (e) => { e.preventDefault(); submit(); }, className: "form" },
				create('label', {}, "Are you coming?"),
				create('select', {
					value: this.state.coming,
					onChange: (e) => { this.setState({ coming: e.target.value }) },
				},
					create('option', { value: "yes" }, "Yes, of course!"),
					create('option', { value: "no" }, "No, but have fun!"),
				),
				create('label', {}, "Invite Code:"),
				create('input', {
					type: 'text',
					value: this.state.code,
					onChange: (e) => { this.setState({ code: e.target.value }) },
					required: true,
				}),
				create('label', {}, "Name:"),
				create('input', {
					type: 'text',
					value: this.state.name,
					onChange: (e) => { this.setState({ name: e.target.value }) },
					required: true,
				}),
				create('label', {}, "Email:"),
				create('input', {
					type: 'email',
					value: this.state.email,
					onChange: (e) => { this.setState({ email: e.target.value }) },
					required: true,
				}),
				create('label', {}, "Additional Guests:"),
				create('input', {
					type: 'text',
					value: this.state.guests,
					onChange: (e) => { this.setState({ guests: parseInt(e.target.value) || 0 }) },
					required: true,
				}),
				create('label', {}, "Message:"),
				create('textarea', {
					rows: 4,
					value: this.state.message,
					onChange: (e) => { this.setState({ message: e.target.value }) },
					placeholder: 'Optional: leave a message for the "happy" couple!',
					spellCheck: true,
				}),
				create("input", { type: "submit", value: "RSVP" }),
			),
		)
	}
}
