const EventEmitter = require('events');

class CroveEmitter extends EventEmitter {}
const croveEmitter = new CroveEmitter();
export default croveEmitter;

// Use this croveEmitter for emitting events related to crove.
