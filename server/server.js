const RPC = require('../');

const rpc = RPC.createInstance({ queue: 'saferx.rpc', server: true });

rpc.Commands.add(rpc.EventCommand.create({
  name: 'rpc.auth',
  callback: require('./rpc/auth')()
}));


rpc.Commands.listen();