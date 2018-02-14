let validator = {
  getAdminValidator: function (req, type) {
    let input = {
      login: {
        email: ['isEmail', req.t('EMAIL_NOT_VALID')],
        password: ['notEmpty', req.t('PASSWORD_NOT_VALID')]
      }
    }
    return input[type]
  }
}

module.exports = validator
