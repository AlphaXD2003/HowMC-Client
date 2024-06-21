const { Router } = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getPteroUser,
  createServer,
} = require("../controllers/user.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

//create a router
const router = Router();

//nonsecured paths
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

//secured paths
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/ptero-user-info").get(verifyJWT, getPteroUser);
/* router.route('/create-server').post(verifyJWT, createServer) */

module.exports = router;
