console.log('Websocket Worker Spawned!');

var HOST = "insertURLhere";
var worker, ws, Types, info;

worker = this;
ws = new WebSocket(`${HOST}:3000`);
info = console.log.bind("[WebSocket Worker]");

ws.addEventListener( 'open', n => info("Worker Websocket Open!") );
ws.addEventListener( 'message', function(remote_message) {
	info("Data received from server: ");
	console.log(remote_message.data);
	worker.postMessage(JSON.parse(remote_message.data));
});
ws.addEventListener( 'close', console.log );
ws.addEventListener( 'error', console.error );

worker.addEventListener('message', function(local_message) {
	info("Data received from main thread: ");
	console.log(local_message.data);
	
	var local_data = local_message.data;
	switch(local_data.t) {
		case -1:
			Types = local_data.d;
			break;
		case Types.Create:
		case Types.Join:
			ws_send(ws, local_data);
			break;
	}
});

function Message(type, data) {
	return {t: type, d: data || null};
}
function ws_send(ws, data) {
	if (ws.readyState !== WebSocket.OPEN) return;
	ws.send(JSON.stringify(data));
}