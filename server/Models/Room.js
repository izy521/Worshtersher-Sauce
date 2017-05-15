var EventEmitter = require('events').EventEmitter;

class Room extends EventEmitter {
	constructor(ws_client, words) {
		super();
		var copied_words, length, index, i;
		
		copied_words = words.slice();
		length = copied_words.length;
		
		this.randomized_words = Array(copied_words.length);
		this.players = [ws_client];
		this.scores  = [0, 0];
		this.current_word = "";
		this.timeout = null;
		
		for (i=0; i<length; i++) {
			index = Math.floor( Math.random() * copied_words.length );
			this.randomized_words[i] = copied_words.splice(index, 1)[0];
		}
	}
	
	async join(ws_client) {
		if (!ws_client) throw new Error("No other client provided");
		if (this.players.length > 1) return false;
		//Returning the `true` after the comma, not the emit.
		return (this.players[1] = ws_client), this.emit('filled'), true;
	}
	
	async start() {
		console.log("Someone joined, and game was started");
		this.current_word = await this.get_new_word();
		
		this.timeout = setTimeout(f => this.emit('game_over', this.scores), 60 * 1000);
	}
	
	async answer(client, word) {
		/*Going to handle the correct and incorrect notifications later*/
		if (word !== this.current_word)
			return this.emit('incorrect_answer', client);
		
		this.scores[ this.players.indexOf(client) ] += 1;
		this.current_word = await this.get_new_word();
		
		this.emit('correct_answer', client);
	}
	
	async get_new_word() {
		var word = this.randomized_words.shift();
		if (!word) return stop();
		return word;
	}
	
	async stop() {
		clearTimeout(this.timeout);
		return this.emit('game_over', this.scores);
	}
}

module.exports = Room;