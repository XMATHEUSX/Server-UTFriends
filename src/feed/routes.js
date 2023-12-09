const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.get("/exibirfeed", controller.buscarFeed);
router.post("/curtirpensamento", controller.curtirPensamento);
router.get("/exibirmeuspensamentos", controller.exibirMeusPensamentos);
router.post("/searchProfile", controller.searchProfile);

module.exports = router;
