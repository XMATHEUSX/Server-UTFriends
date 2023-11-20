const express = require("express");
const bodyParser = require("body-parser");
const profileRouter = require("./src/profile/routes");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(cors());

app.use("/api/v1/profile", profileRouter);

app.listen(process.env.PORT|| 3000, () => {
  console.log(`Servidor rodando em http://localhost:${process.env.PORT}`);
});
