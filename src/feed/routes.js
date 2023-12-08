const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/exibirfeed", controller.buscarFeed);
router.post("/curtirpensamento", controller.curtirPensamento);
router.post("/searchProfile",controller.searchProfile);



module.exports = router;
