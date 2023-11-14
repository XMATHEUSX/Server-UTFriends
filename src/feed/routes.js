const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/exibirfeed", controller.getFeed);

module.exports = router;
