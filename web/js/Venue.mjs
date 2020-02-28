const create = React.createElement

export class Venue extends React.Component {
	render() {
		return create("div", { className: "venue" },
			create("p", { className: "section" }, 
				create("h3", {}, "Stern Grove"),
				create("p", {}, "We're getting married in Stern Grove, a beautiful park in San Francisco. Don't forget to bring a sweater!"),
				create("p", {}, "The ceremony will be held outside, adjacent to the Trocadero Clubhouse. It's a large yellow building with a parking lot and a cute lake, relatively close to the amphitheater. For lunch, there will be seating inside the clubhouse and outside under the redwood trees."),
				create("div", { className: "polaroids" }, 
					create("div", { className: "polaroid" }, 
						create("img", { src: "images/stern2.jpg" }),
						create("p", {}, "Main Entrance"),
					),
					create("div", { className: "polaroid" }, 
						create("img", { src: "images/stern3.jpg" }),
						create("p", {}, "Trocadero Clubhouse"),
					),
				),
			),
			create("p", { className: "section" }, 
				create("h3", {}, "Directions"),
				create("p", {}, "There are two entrances to the park. The main entrance is at the corner of 19th Ave and Sloat Blvd and the other is on the corner of Vale Ave and Sloat Blvd. Both entrances have access to free, public parking lots."),

				create("p", {}, create("strong", {}, "If you're driving"), " and wish to enter at the corner of 19th Ave and Sloat Blvd, you need to drive up onto the sidewalk through the metal arch that says \"Stern Grove\". You will then continue down a mildly steep grade that on Google Maps is called \"Stern Grove Entry Rd\" - for about 200 yards. The Trocadero Clubhouse will be directly in front of you and on your left you'll see the parking lot."),

				create("p", {}, create("strong", {}, "If you're driving"), " and wish to enter at the corner of Vale Ave and Sloat Blvd (more parking available in this lot), simply turn on to Vale Ave. You will then drive down a wide road to the large Pine Lake Park/Vale Avenue Parking Lot. From there, walk east along the flat paved path towards the concert meadow for about 200 yards. Continue across the amphitheater and you'll see the Trocadero Clubhouse on your left, just beyond the concert meadow."),

				create("p", {}, "Street parking is also available on any of the residential blocks around Stern Grove. Pay attention to the signs for any parking restrictions!"),

				create("p", {}, create("strong", {}, "If you're on foot"), " enter either at 19th Ave and Sloat Blvd or Vale Ave and Sloat Blvd and walk along the paved pathway. Follow the relevant 'if you're driving' directions above, but with your feet and without parking."),

				create("p", {}, create("strong", {}, "If you're ride sharing"), " you'll likely be dropped off at the main entrance on 19th Ave and Sloat Blvd and will have to walk through the metal arch that says 'Stern Grove'. You'll then continue on foot down a midly steep grade for about 200 yards until you arrive at the Trocadero Clubhouse."),

				create("p", {}, create("strong", {}, "If you're taking the streetcar"), " take the M (Ocean View) or the K (Ingleside) and exit at the St. Francis Circle stop. Walk one block west to the main park entrance."),

				create("p", {}, create("strong", {}, "If you're taking the bus"), " the 23 (Monterey) and the 28 (19th Avenue) stop right at the main etrance."),

				create("p", {}, create("strong", {}, "Please note:"), " Because it sits near the southwestern edge of the city, public transit to Stern Grove can be time-consuming and Muni runs a lot less frequently on weekends. Also note: please IGNORE the 'Wawona Street' directions on the Google map below. Wawona Street directions are INCORRECT and you should follow our directions above."),  

				create("iframe", {
					frameBorder: 0,
					style: { 
						border: 0,
						width: "100%",
						maxWidth: "50rem",
						height: "30rem",
						margin: "0 auto",
						display: "block",
					},
					src: "https://www.google.com/maps/embed/v1/place?q=place_id:ChIJIzHUu5d9j4ARtTe8PtcVMuk&key=AIzaSyBHbu8SRsWzGDQvAsOL9u3IDjWDydiv31w",
					allowfullscreen: true,
				}),
			),
		)
	}
}
