const amqp = require('amqplib');

class Commands {
  constructor(options) {
    this.options = options;
    this.handlers = {};
  }

  add(cmd) {
    if (cmd.name in this.handlers) {
      throw new Error(`Handler with the name ${cmd.name} already exist`);
    }
  
    this.handlers[cmd.name] = cmd.callback;
  }

  get(name) { return this.handlers[name]; }

  listen() {
    const replyTo = (ch, msg, result) => {
      ch.sendToQueue(msg.properties.replyTo,
        new Buffer(JSON.stringify(result) || []),
        {correlationId: msg.properties.correlationId});
  
      ch.ack(msg);
    };

    return this.options.conn.then((conn) => {
      return conn.createChannel().then((ch) => {
        ch.assertQueue(this.options.queue, {durable: false});
        ch.prefetch(8);
        
        this.options.logger.log(' [x] Awaiting RPC requests');
        
        ch.consume(this.options.queue, (msg) => {
          let data = null;

          const command = msg.properties.headers.Request;
          
          try {
            data = JSON.parse(msg.content.toString());
          } catch(ex) { this.options.logger.error(ex); }
  
          const handler = this.get(command);
          
          if (typeof handler !== 'function') {
            replyTo(ch, msg);
          } else {
            try {
              Promise.resolve(handler(data)).then((result) => {
                replyTo(ch, msg, result);
              }).catch((error) => {
                replyTo(ch, msg, error);
              });
            } catch(ex) {
              this.options.logger.error(ex);
              replyTo(ch, msg);
            }

          }
        });
      });
    });
  };
}

module.exports = (options) => {
  return new Commands(options);
};