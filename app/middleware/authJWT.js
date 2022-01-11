const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const jwtToken = req.header("token");
    if (!jwtToken) {
      return res.json({ message: "Not Authorize." });
    }
    const payload = jwt.verify(jwtToken, process.env.secretJWT);
    req.user = payload.user;
  } catch (err) {
    return res.json(err.message);
  }

  next();
};
