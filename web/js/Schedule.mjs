const create = React.createElement

export class Schedule extends React.Component {
	render() {
		return create("div", { className: "schedule" },
			create("div", { className: "section" }, 
				create("h3", {}, "Schedule"),

				create("div", { className: "timeslot" }, "10:45am"),
				create("p", {}, "Music and mingling for any guests that (rightfully so) arrive early."),

				create("div", { className: "timeslot" }, "11:15am"),
				create("p", {}, "The romantic ceremony starts."),

				create("div", { className: "timeslot" }, "11:45am"),
				create("p", {}, "Lunch and open bar"),

				create("p", {}, "Note: El Sur food truck will be parked in the adjacent parking lot and serve mouthwatering, delicious empanadas and/or skewers of your choice. Just go up to the truck and place your order. There will also be a salad bar and plenty of other lunch items on a buffet table at the clubhouse. The bar is also located in the clubhouse." ),

				create("p", {}, "Other Note: We aren't having a formal sit-down reception so once the ceremony is over, feel free to schmooze, grab food at the truck and/or buffet line (see above), enjoy the lovely outdoors, or head to the clubhouse and start dancing the afternoon away. Seating will be available in the clubhouse and outside where the ceremony took place." ),

				create("div", { className: "timeslot" }, "12:45pm"),
				create("p", {}, "Cake-cutting"),

				create("div", { className: "timeslot" }, "1:00pm+"),
				create("p", {}, "Eating, chatting, drinking, dancing!"), 

				create("div", { className: "timeslot" }, "3:30pm"),
				create("p", {}, "Party ends and cleanup starts. We may need help taking out the trash."),

				create("div", { className: "timeslot" }, "4:00pm"),
				create("p", {}, "Hard deadline to leave the clubhouse and make room for the next event."),

				create("div", { className: "polaroids" },
					create("div", { className: "polaroid" },
						create("img", { src: "images/stern.jpg" }),
						create("p", {}, "THE SPOT"),
					),
				),
			),
		)
	}
}
