const jwt = require("jsonwebtoken");

const jwtGenerator = (user_id) => {
  const payload = {
    user: user_id,
  };
  return jwt.sign(payload, process.env.secretJWT, { expiresIn: "12hr" });
};

module.exports = jwtGenerator;
