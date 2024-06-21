const { Router } = require("express");
const { getEggInfo, getServerOfEgg } = require("../controllers/eggs.controller");

const router = Router();

router.route("/egginfo/:nestId/:eggId").get(getEggInfo);
router.route("/serverofegg/:nestId/:eggId").get(getServerOfEgg);

module.exports = router;
