function Message(data) {
	if (!data) throw new Error("No data provided to Message constructor");
	if (!data.constructor.hasOwnProperty('Type')) throw new Error("No Message Type for provided data");
	
	return JSON.stringify({t: data.constructor.Type, d: data});
}

module.exports = Message;