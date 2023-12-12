const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/user", controller.userInfo);
router.post("/usersearch", controller.userSearch);
router.post("/verify", controller.verify);
router.post("/verifypassword", controller.verifyPassword);
router.post("/update", controller.update);
router.post("/delete", controller.deleteUser);
router.post("/infoConta", controller.infoConta); 
router.post("/followUser", controller.followUser);
router.post("/exibirmeuspensamentos", controller.exibirMeusPensamentos);
router.post("/updatepassword", controller.updatePassword);
router.post("/forgetpassword", controller.forgetPassword);
router.get("/healthcheck", controller.healthCheck);
router.get("/ok", controller.ok);

module.exports = router;
