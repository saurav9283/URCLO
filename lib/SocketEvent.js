// const { getIO } = require("./socket");

const emitSocketEvent = (io,roomId, event, payload) => {
  console.log({io,roomId, event, payload},'emitting');
  // const io = getIO();
  // const io = require('../app.js').get('io');

  io.in(roomId.toString()).emit(event, payload);
};

module.exports = { emitSocketEvent };