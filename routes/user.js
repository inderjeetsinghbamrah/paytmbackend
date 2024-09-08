const express = require("express");

const zod = require("zod");

const { User, Account } = require("../db");

require("dotenv").config();

const jwt = require("jsonwebtoken");
const { authMiddleware } = require("../middleware/middleware");

const router = express.Router();

const signupBody = zod.object({
  username: zod.string().email(),
  firstname: zod.string(),
  lastname: zod.string(),
  password: zod.string(),
});

const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

router.post("/signup", async (req, res) => {
  const { success } = signupBody.safeParse(req.body);
  if (!success)
    return res.status(411).json({
      message: "Email already taken/ Incorrect Input",
    });

  const existingUser = await User.findOne({ username: req.body.username });

  if (existingUser)
    return res.status(411).json({
      message: "Email Already Exist",
    });

  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  });

  const userId = user._id;

//   account creation and assigning random balance

await Account.create({
    userId,
    balance:1+Math.random()*10000
})

  const token = jwt.sign({ userId }, process.env.JWT_SECRET);

  res.json({ message: "User Created successfully", token: token });
});

router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);

  if (!success)
    return res.status(411).json({
      message: "Incorrect Input",
    });

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET
    );
    return res.json({ token: token, userId:user._id });
  }
  res.status(411).json({ message: "Error while logging in" });
});

const updateBody = zod.object({
  password: zod.string().optional(),
  firstname: zod.string().optional(),
  lastname: zod.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({
      message: "Error while updating Information",
    });
  }

  await User.updateOne({ _id: req.userId }, req.body);

  res.status(200).json({ message: "Updated Successfully" });
});

router.get("/bulk", async (req, res) => {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstname: {
          "$regex": filter,
        },
      },
      {
        lastname: {
          "$regex": filter,
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      _id: user._id,
    })),
  });
});

module.exports = router;
