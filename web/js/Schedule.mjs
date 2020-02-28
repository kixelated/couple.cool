const create = React.createElement

export class Schedule extends React.Component {
	render() {
		return create("div", { className: "Schedule" },
			create("p", { className: "Schedule" }, 
				create("h3", {}, "Schedule"),
				create("p", {}, "10:45am: Music and mingling"),
				create("p", {}, "11:15am: Ceremony begins" ) ,
				create("p", {}, "11:45am: Lunch and open bar" ) ,
					create("p", {}, "Note: El Sur food truck will be parked in the adjacent parking lot and serve mouthwatering, delicious empanadas and/or skewers of your choice. Just go up to the truck and place your order. There will also be a salad bar and plenty of other lunch items on a buffet table at the clubhouse. The bar is also located in the clubhouse." ) ,   

					create("p", {}, "Other Note: We aren't having a formal sit-down reception so once the ceremony is over, feel free to schmooze, grab food at the truck and/or buffet line (see above), enjoy the lovely outdoors, or head to the clubhouse and start dancing the afternoon away. Seating will be available in the clubhouse and outside where the ceremony took place." ) ,  

				create("p", {}, "12:45pm: Cake-cutting" ) ,   

				create("p", {}, "12:45pm onward: Eating, chatting, drinking, dancing" ) , 
 

				create("p", {},"The ceremony will be held outside, adjacent to the Trocadero Clubhouse. It's a large yellow building with a parking lot and a cute lake, relatively close to the amphitheater. For lunch, there will be seating inside the clubhouse and outside under the redwood trees."),

create("p", {},"The party will end by 3:30pm and we have a hard deadline to vacate the premises of all people and trash by 4:00pm. We may need help cleaning up!"),  

					),
		
				create("p", {}, "The ceremony starts at 11:15am and lunch is served immediately afterwards. The party will end by 3:30pm and we have a hard deadline to vacate the premises of all people and trash by 4:00pm. We may need help cleaning up!"),
				create("div", { className: "polaroids" },
					create("div", { className: "polaroid" },
						create("img", { src: "images/stern.jpg" }),
						create("p", {}, "THE SPOT"),

),
			),
		)
	}
}
