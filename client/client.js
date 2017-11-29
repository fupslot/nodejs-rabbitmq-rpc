const RPC = require('../');

const rpc = RPC.createInstance({ queue: 'saferx.rpc', client: { name: 'api' } });

const authCmd = rpc.EventCommand.create('rpc.auth', { username: 'fdashlot@gmail.com' });
rpc.Invoker.execute(authCmd).then((data) => {
  console.log(data);
}).catch(console.error);

rpc.Invoker.execute(authCmd).then((data) => {
  console.log(data);
}).catch(console.error);