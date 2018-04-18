const SNEKFETCH = require('snekfetch');

const base = 'https://discordapp.com/api/v6';

module.exports = {
  req: function(METHOD, ENDPOINT, DATA, TOKEN) {
    return new Promise((res, rej) => {
      new SNEKFETCH(METHOD, base + ENDPOINT, { headers: { Authorization: 'Bot ' + TOKEN, 'Content-Type': 'application/json' }, data: DATA }).then(c => {
        res(c.body);
      }).catch(rej);
    });
  }
};