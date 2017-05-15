(function(global, document) {
	if (!global.Worker) throw new Error("Your browser does not support Web Workers");
	
	var ws_worker, code_area, current_word, time_area;
	var [create_button, join_button] = document.getElementsByClassName('menu_button');
	
	var Types = global.Types = {
		Error:  0,
		Create: 1,
		Join:   2,
		Result: 3
	};
	
	ws_worker = new Worker('web/js/workers/websocket.js');
	code_area = document.getElementsByClassName('code_area')[0];
	current_word = document.getElementsByClassName('current_word')[0];
	time_area = document.getElementsByClassName('time')[0];
	
	ws_worker.postMessage({t: -1, d: Types});
	
	create_button.addEventListener('click', create_room);
	join_button.addEventListener('click', join_room);
	ws_worker.addEventListener('message', handle_ws_message);
	
	function create_room(event) {
		remove_elements('menu_item');
		show_elements('game_starter_item');
		code_area.value = "";
		code_area.disabled = true;
		
		return ws_worker.postMessage({t: Types.Create});
	}
	
	function join_room(event) {
		remove_elements('menu_item');
		show_elements('game_starter_item');
		code_area.value = "";
		return code_area.addEventListener('keyup', handle_enter_key);
	}
	
	function start_game() {
		remove_elements('game_starter_item');
	}
	
	function handle_ws_message(remote_message_event) {
		var remote_data = remote_message_event.data;
		
		switch(remote_data.t) {
			case Types.Create:
				code_area.value = remote_data.d.code;
				break;
			case Types.Join:
				start_game();
				break;
			case Types.Error:
				console.error(remote_data.d);
				break;
		}
	}
	
	function handle_enter_key(event) {
		//Crunching on time to get this in before its due
		//So there's just a one-time enter press to join the game,
		//then they'll have to refresh...
		if (event.keyCode !== 13) return;
		ws_worker.postMessage({t: Types.Join, d: code_area.value.slice(0, 6)});
	}
	function remove_elements(class_name) {
		return Array.prototype.forEach.call(
			document.getElementsByClassName(class_name),
			e => e.classList.add('hidden')
		);
	}
	function show_elements(class_name) {
		return Array.prototype.forEach.call(
			document.getElementsByClassName(class_name),
			e => e.classList.remove('hidden')
		);
	}
	
	(function run_tips_ticker() {
		var tips, tips_element;
		
		tips = [
		`Most mobile devices have better microphones than typical laptop microphones. If you're having trouble, try playing on a mobile device.`,
		`Speak loud and clear.`,
		`Try to reduce any background noise.`
	];
	
	tip_element = document.getElementsByClassName('tip')[0];
	tip_element.textContent = tips[0];
	tip_element.addEventListener('animationiteration', event => tip_element.textContent = tips[ Math.floor(Math.random() * tips.length) ] );
		
	})();
	
	remove_elements('game_starter_item');
	//remove_elements('menu_item');
	remove_elements('game');
})(window, document);