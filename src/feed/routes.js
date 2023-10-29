const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/pensamento", controller.pensamento);
