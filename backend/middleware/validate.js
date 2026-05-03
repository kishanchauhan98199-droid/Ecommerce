const { body, param, validationResult } = require("express-validator");

/* Run validation */
const validate = (rules) => async (req, res, next) => {
  await Promise.all(rules.map((r) => r.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

/* Rules */
const rules = {
  register: [
    body("name").isLength({ min: 2 }),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],

  login: [
    body("email").isEmail(),
    body("password").notEmpty(),
  ],
};

module.exports = { validate, rules };