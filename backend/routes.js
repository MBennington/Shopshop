const router = require("express").Router();

router.use("/users", require("./src/modules/users/user.router"));

module.exports = router;