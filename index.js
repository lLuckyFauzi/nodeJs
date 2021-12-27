require("dotenv").config();
const express = require("express");
const app = express();
const router = require('./Routes/user');

app.use(router);

app.get(router);

app.post(router);

app.delete(router);

app.put(router);

app.listen(process.env.PORT, () =>
  console.log("Listening at port: " + process.env.PORT)
);