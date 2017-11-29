// RPC
const crypto =  require('crypto');
const amqp = require('amqplib');

const randomString = (size) => {
  if (size === 0) {
    throw new Error('Zero-length randomString is useless.');
  }
  const chars = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
               'abcdefghijklmnopqrstuvwxyz' +
               '0123456789');
  let objectId = '';
  const bytes = crypto.randomBytes(size);
  for (let i = 0; i < bytes.length; ++i) {
    objectId += chars[bytes.readUInt8(i) % chars.length];
  }
  return objectId;
};

module.exports.createInstance = (options) => {
  const conn = amqp.connect(options.url);
  
  options = Object.assign({}, options, { conn, logger: console });
  options.customQueueName = (name) => {
    if (!options.client.name) return null;
    return `rpc-${options.client.name}-${name}-${randomString(12)}`;
  };

  return {
    EventCommand: require('./EventCommand'),
    Commands: options.server ? require('./Commands')(options): null,
    Invoker: options.client ? require('./Invoker')(options) : null,
  };
};