class WebSocketError {
	constructor(message) {
		console.error(message);
		this.message = message;
	}
}

WebSocketError.Type = 0;

module.exports = WebSocketError;