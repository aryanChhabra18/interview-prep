const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const { UserModel} = require("../db");
// const { JWT_USER_SECRET } = require("../config");

const userRouter = Router();

const JWT_USER_SECRET = "12345"

userRouter.post("/signup", async function (req, res) {
    const requiredBodyFormat = z.object({
        email: z.string().email(),
        password: z.string(),
        username: z.string()
    });

    const inputValidation = requiredBodyFormat.safeParse(req.body);

    if (!inputValidation.success) {
        return res.status(400).json({
            message: "Incorrect Input",
            error: inputValidation.error
        });
    }

    const { username, email, password } = req.body;

    try {
        const hashedpassword = await bcrypt.hash(password, 5);
        await UserModel.create({
            username, email, password:hashedpassword
        });
        return res.json({
            message: "Your account has been created"
        });
    } catch (e) {
        return res.status(500).json({
            message: "There is an error",
            error: e.message
        });
    }
});

userRouter.post("/signin", async function (req, res) {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (passwordMatched) {
        const token = jwt.sign(
            { id: user._id.toString() },
            JWT_USER_SECRET
        );
        return res.json({ token });
    } else {
        return res.status(403).json({ msg: "Incorrect Credentials" });
    }
});

module.exports = {userRouter};