const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/login", controller.login);
router.post("/register", controller.register);
router.get("/healthcheck", controller.healthCheck);
router.get("/ok", controller.ok);

module.exports = router;
