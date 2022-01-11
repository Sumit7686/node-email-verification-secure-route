const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = 7686 || process.env.PORT;
const http = require('http')
const socketIO = require('socket.io')
require("dotenv").config();

// Database Connection.
const url = process.env.MONGODB_URL;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Database Connected...");
});

// Permission
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

// API Routes
app.use("/auth", require("./app/routes/auth"));

// Socket.io
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log("New Connection");
})

app.listen(PORT, () => {
  console.log(`Server has been started on PORT ${PORT}`);
});
