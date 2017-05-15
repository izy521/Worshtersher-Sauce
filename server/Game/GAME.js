var _MODELSDIR     = `../Models`;
var _MESSAGESDIR   = `${_MODELSDIR}/Messages`;

var WebSocket      = require('ws');

var Models         = {
	Room           :require(`${_MODELSDIR}/Room.js`),
	Message        :require(`${_MODELSDIR}/Message.js`),
	Messages:{
		Create         :require(`${_MESSAGESDIR}/Create.js`),
		Join           :require(`${_MESSAGESDIR}/Join.js`),
		GameResult     :require(`${_MESSAGESDIR}/GameResult.js`),
		WebSocketError :require(`${_MESSAGESDIR}/WebSocketError.js`)
	}
};
var words          = require('../words.js');

class GAME {
	constructor(port = 3000) {
		this.rooms = {};
		this.ws_server = new WebSocket.Server({port: port});
		
		this.ws_server.on('connection', handle_connection.bind(null, this));
		console.log("Game created");
	}
	
	async create_room(client) {
		if (!client) throw new Error('No WebSocket client provided');
		var room, room_id;
		
		while (this.rooms.hasOwnProperty(room_id = generate_id())) {
			console.log(`Duplicate ID generated (${room_id}), generating new one.`);
			room_id = generate_id();
		}
		
		room = this.rooms[room_id] = new Models.Room(client, words);
		room.id = room_id;
		client.room_id = room_id;
		
		console.log(`Room created: ${room_id}`);
		client.send( Models.Message(new Models.Messages.Create(room_id)) );
		
		room.once('filled', room.start);
		room.once('game_over', handle_game_over.bind(null, this, room));
	}
	
	async join_room(client, room_id) {
		if (!room_id) 
			return client.send( Models.Message(new Models.Messages.WebSocketError("Error: code/room ID")) );
		if (!this.rooms.hasOwnProperty(room_id)) 
			return client.send( Models.Message(new Models.Messages.WebSocketError("Error: No room found with that ID")) );
		if ( !(await this.rooms[room_id].join(client)) )
			return client.send( Models.Message(new Models.Messages.WebSocketError("Error: This room is filled")) );
	}
}

module.exports = GAME;

function generate_id() {
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVXYZ0123456789';
	var string = '';
	
	for (var i=0; i<6; i++) {
		string += chars[ Math.floor(Math.random() * chars.length) ];
	}
	
	return string;
}

async function handle_connection(game, client) {
	console.log("New client connected");
	/* I attempt to not rely on `this` whenever possible
	 * I'd rather just pass the object as an argument
	 */
	client.on('message', handle_client_message.bind(null, game, client));
}

async function handle_client_message(game, client, string_data) {
	var message;
	try {
		message = JSON.parse(string_data);
	} catch(e) {
		client.send( Models.Message(new Models.Messages.WebSocketError("Error: Could not parse input")) );
		throw new Error(e);
	}
	console.log(message);
	switch(message.t) {
		case Models.Messages.Create.Type:
			game.create_room(client);
			break;
		case Models.Messages.Join.Type:
			game.join_room(client, message.d);
			break;
		case Models.Messages.Answer.Type:
			game.answer(client)
		
	}
}

function handle_game_over(game, room) {
	console.log(`Game Ended: ${room.id}`);
	var [players, scores] = [room.players, room.scores];

	/*
	 * -1 = Tied
	 * 0  = Player 1 wins
	 * 1  = Player 2 wins
	 */
	if (scores[0] === scores[1]) {
		players.forEach( 
			player => player.send( Models.Message( new Models.Messages.GameResult( -1 ) ) ) 
		);
	} else {
		players.forEach( 
			player => player.send( Models.Message( new Models.Messages.GameResult( +(scores[1] > scores[0]) ) ) ) 
		);
	}

	delete game.rooms[room_id];
	room = null;
}
