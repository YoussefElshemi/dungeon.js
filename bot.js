const { Client } = require('./index');
const client = new Client('NDEzNzg0MzM5NDgyOTM1Mjk2.DaZhqw.0mPpfl2AbXF0jiCQeVme3NpzYNQ');

client.on('ready', async () => {
  console.log(client.user.tag + ' is ready!');
});

client.on('message', message => {
  if (message.author.bot) return;
  if (message.content === 'ping') {
    message.channel.send('Pinging....').then(c => {
      c.edit(`Ponged! It took me ${c.createdTimestamp - message.createdTimestamp}ms to respond!`).then(d => {
        d.channel.setTopic(`Ping: ${c.createdTimestamp - message.createdTimestamp}`).then(a => {
          a.guild.createChannel(`Ping: ${c.createdTimestamp - message.createdTimestamp}`, 'text');
        });
      });
    });
  }
});