const SNEKFETCH = require('snekfetch');

const base = 'https://discordapp.com/api/v6';

let ratelimited, ratelimitoff; 

module.exports = {
  req: function(METHOD, ENDPOINT, DATA, TOKEN) {
    return new Promise((res, rej) => {
      if (!ratelimited) { 
        new SNEKFETCH(METHOD, base + ENDPOINT, { headers: { Authorization: 'Bot ' + TOKEN, 'Content-Type': 'application/json' }, data: DATA }).then(c => {
          if (c.headers['x-ratelimit-remaining'] === '0') {
            ratelimited = true;
            ratelimitoff = c.headers['x-ratelimit-reset'] * 1000;
          }
          res(c.body);
        }).catch(err => {
          if (err && err.body && err.message && err.message === 'You are being rate limited.') Promise.reject(err.body.message);
        });
      } else {
        setTimeout(() => {
          this.rateLimitedReq(METHOD, ENDPOINT, DATA, TOKEN).then(c => {
            res(c.body);
          }).catch(O_o => {});
          ratelimited = false;
        }, ratelimitoff - new Date().getTime());
      }
    });
  },
  rateLimitedReq: function(METHOD, ENDPOINT, DATA, TOKEN) {
    return new Promise((res, rej) => {
      new SNEKFETCH(METHOD, base + ENDPOINT, { headers: { Authorization: 'Bot ' + TOKEN, 'Content-Type': 'application/json' }, data: DATA }).then(c => {
        if (c.headers['x-ratelimit-remaining'] === '0') {
          ratelimited = true;
          ratelimitoff = c.headers['x-ratelimit-reset'] * 1000;
        }
        res(c.body);
      }).catch(err => {
        if (err && err.body && err.message && err.message === 'You are being rate limited.') Promise.reject(err.body.message);
      });
    });
  },
};