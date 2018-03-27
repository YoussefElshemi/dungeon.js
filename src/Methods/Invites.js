module.exports = function () {
  const _this = this;

  return {
    fromRaw: function (raw) {
      raw.delete = function () {
        return new Promise((res) => {
          request.req("DELETE", `/invites/${raw.code}`, {}, _this.token)
            .then(i => {
              setTimeout(res, 100, res(_this.invite_methods().fromRaw(i)));
            });
        });
      };

      raw.guild = _this.guild_methods().fromRaw(raw.guild);
      raw.inviter = _this.gu_methods().fromRaw(raw.inviter, raw.guild);

      return raw;
    }
  };
};
