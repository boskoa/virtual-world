const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");

const app = express();
app.use(express.json());
app.use(cors());
app.use("/phone", express.static(__dirname));

app.get("/phone", (_, res) => {
  res.sendFile(path.join(__dirname, "/phone.html"));
});

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

https.createServer(options, app);
app.listen(3003, function () {
  console.log("Server is running on port", 3003);
});
