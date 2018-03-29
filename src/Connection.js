const nekocurl = require('nekocurl');

const base = 'https://discordapp.com/api/v6';

module.exports = {
  req: function(METHOD, ENDPOINT, DATA, TOKEN) {
    return new Promise((res, rej) => {
      (new nekocurl(
        base + ENDPOINT, {
          method: METHOD,
          headers: {
            Authorization: 'Bot ' + TOKEN
          },
          data: JSON.stringify(DATA),
          json: true
        }
      )).send().then(res).catch(rej);
    });
  }
};
