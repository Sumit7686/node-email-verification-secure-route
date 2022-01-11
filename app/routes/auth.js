const app = require("express").Router();
const nodeMailer = require("nodemailer");

// components
const jwtGenerator = require("../utils/jwtGenerator");
const authJWT = require("../middleware/authJWT");

// Models.
const User = require("../models/user.schema");

// otp
const transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.emailForOtp,
    pass: process.env.passwordForOtp,
  },
});
var otp = Math.floor(Math.random() * 100000) + 111111;

// APIs.
app.post("/sign-up-user", async (req, res) => {
  let reqUserData = User(req.body);
  let email = reqUserData.email;
  let userName = reqUserData.userName;

  User.findOne({ email })
    .then((resultEmail) => {
      if (resultEmail === null) {
        User.findOne({ userName })
          .then((resultUserName) => {
            if (resultUserName === null) {
              reqUserData
                .save()
                .then((result) => {
                  return res.json({
                    isValid: true,
                    message: result,
                  });
                })
                .catch((err) => {
                  console.log("sign up user err :::", err);
                  return res.json({
                    isValid: false,
                    message: "Not a save your data.",
                  });
                });
            } else {
              return res.json({
                isValid: false,
                message: "User Name is already exits.",
                data: resultUserName,
              });
            }
          })
          .catch((err) => {
            return res.json({
              isValid: false,
              message: "sign up check user name error.",
              err,
            });
          });
      } else {
        return res.json({
          isValid: false,
          message: "Email is already exits.",
          data: resultEmail,
        });
      }
    })
    .catch((err) => {
      return res.json({
        isValid: false,
        message: "sign up check email error.",
        error: err,
      });
    });
});

var sendOtp;
app.post("/send-otp", async (req, res) => {
  let email = req.body.email;
  let userName = req.body.userName;

  User.findOne({ email })
    .then((resultEmail) => {
      if (resultEmail === null) {
        User.findOne({ userName })
          .then((resultUserName) => {
            if (resultUserName === null) {
              var mailOptions = {
                to: email,
                subject: "Email verification Code For Chat-App",
                html:
                  "<h3>Verification code: </h3>" +
                  "<h1 style='font-weight:bold;'>" +
                  otp +
                  "</h1>" +
                  "<p>Please do not share code another person.</p>",
              };
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  return res.json({
                    isValid: false,
                    message: "send otp error",
                    error: error,
                  });
                } else {
                  sendOtp = otp;
                  return res.json({
                    isValid: true,
                    message: sendOtp,
                    info: info,
                  });
                }
              });
            } else {
              return res.json({
                isValid: false,
                message: "User Name is already exits.",
                data: resultUserName,
              });
            }
          })
          .catch((err) => {
            return res.json({
              isValid: false,
              message: "send otp check user name error.",
              err,
            });
          });
      } else {
        return res.json({
          isValid: false,
          message: "Email is already exits.",
          data: resultEmail,
        });
      }
    })
    .catch((err) => {
      return res.json({
        isValid: false,
        message: "send otp check email error.",
        err,
      });
    });
});

app.post("/otp-verify", async (req, res) => {
  let otp = req.body.otp;
  if (otp === sendOtp) {
    return res.json({ isValid: true, message: sendOtp, otp });
  } else {
    return res.json({ isValid: false, message: "Otp is Wrong." });
  }
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  User.find({ email, password })
    .then((result) => {
      const token = jwtGenerator(result[0].id);
      return res.json({
        isValid: true,
        message: "Login Successfully",
        token,
        result,
      });
    })
    .catch((err) => {
      return res.json({
        isValid: false,
        message: "Email and password does not match.",
        err,
      });
    });
});

// not use.
app.get("/login-verify", authJWT, async (req, res) => {
  try {
    return res.json({ isValid: true });
  } catch (err) {
    console.log("is verify error :", err.message);
    return res.json({ message: "Server Error." });
  }
});

app.post("/forgot-password-check-email", async (req, res) => {
  const { email } = req.body;

  User.findOne({ email })
    .then((result) => {
      if (result !== null) {
        var mailOptions = {
          to: email,
          subject: "Forgot password OTP for Chat-App",
          html:
            "<h3>Forgot Password code: </h3>" +
            "<h1 style='font-weight:bold;'>" +
            otp +
            "</h1>" +
            "<p>Please do not share code another person.</p>",
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.json({
              isValid: false,
              message: "send otp error",
              err,
            });
          } else {
            sendOtp = otp;
            return res.json({
              isValid: true,
              message: sendOtp,
              result,
              info,
            });
          }
        });
      } else {
        return res.json({ isValid: false, message: "Email is not match." });
      }
    })
    .catch((err) => {
      return res.json({
        isValid: false,
        message: "forgot password check email err.",
        err,
      });
    });
});

app.post("/forgot-password", async (req, res) => {
  let { password, email } = req.body;

  User.findOneAndUpdate({ email }, { $set: { password } })
    .then((result) => {
      return res.json({
        isValid: true,
        message: "Successfully password update.",
        result,
      });
    })
    .catch((err) => {
      return res.json({ isValid: false, message: "Server Error.", err });
    });
});

module.exports = app;
