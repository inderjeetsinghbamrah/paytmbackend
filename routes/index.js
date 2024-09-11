const express = require("express");
import userRouter from "./user";
const accountRouter = require("./account");
const router = express.Router();

router.use("/user", userRouter);

router.use("/account", accountRouter);

module.exports = router;
