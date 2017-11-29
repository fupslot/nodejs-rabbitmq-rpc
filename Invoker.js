const amqp = require('amqplib');
const crypto = require('crypto');

class Invoker {
  constructor(options) {
    this.options = options;
    this.execute = this.execute.bind(this);
  }

  execute(cmd) {
    return new Promise((resolve) => {
      this.options.conn.then((conn) => {
        return conn.createChannel().then((ch) => {
          return ch.assertQueue(
            this.options.customQueueName(cmd.name),
            {exclusive: true, autoDelete: true}
          ).then((q) => {
            const corr = crypto.randomBytes(10).toString('hex');
            
            ch.consume(q.queue, (msg) => {
              ch.close();
              
              if (msg.properties.correlationId === corr) {  
                this.options.logger.log(' [.] Got %s', msg.content.toString());
                
                let data;
                
                try {
                  data = JSON.parse(msg.content.toString());
                } catch(ex) { this.options.logger.error(ex); }
  
                resolve(data);
              }

            }, {noAck: true});

            // timeout 500
  
            return ch.sendToQueue(
              this.options.queue,
              new Buffer(JSON.stringify(cmd)),
              {
                correlationId: corr,
                replyTo: q.queue,
                contentType: 'application/json',
                contentEncoding: 'utf8',
                headers: {
                  Request: cmd.name
                }
              }
            );
          });
        });
      }).catch((error) => this.options.logger.error(error));
    });
  }
}


module.exports = (options) => {
  return new Invoker(options);
};