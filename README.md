# dungeon.js
A Discord API wrapper for node.js

![](https://img.shields.io/npm/dt/dungeon.js.png)
![](https://img.shields.io/github/downloads/YoussefElshemi/dungeon.js/total.png)
![](https://img.shields.io/npm/v/dungeon.js.png)

![](https://nodei.co/npm/dungeon.js.png?downloads=true&downloadRank=true&stars=true/)

## Information
This library was started of by one of our developers, tolopolop. After a few months of giving up, I, Youssef, decided to carry on the project along with tolopolop, I invited two new developers, Caalyx and OGNovuh, who have become a tremendous help with creating the library and make it more efficient. 

If you don't already know, this library is an api wrapper for discord V6. 

## Example
```js
const discord = require('dungeon.js');
const client = new discord.Client('TOKEN');

client.on('ready', () => {
  console.log('bot is on');
});

client.on('message', async message => {
  if (message.author.bot) return;
  if (message.content === 'ping') {
      message.reply('Pong!');
  }
});
```

## Contribution
If you wish to contribute to this API, please visit the [GitHub](https://github.com/YoussefElshemi/dungeon.js)

1. Fork the repository
2. Edit it
3. Make a PR and ensure you include as much detail possible to allow the developers to gain an understanding in which your pull request makes.