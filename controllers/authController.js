const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const db = require("../models/index");
const User = db.User;

exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) return res.status(401).json({ messgae: "Please enter complete details!" });

        const checkUser = await User.findOne({ where: { email } });
        if (checkUser) return res.status(400).json({ message: "User Already present!" });

        const hashPassword = await bcrypt.hash(password, 10);

        const createUser = await User.create({ firstName, lastName, email, password: hashPassword });

        return res.status(201).json({ message: "Registration Successfull!", createUser });

    } catch (err) {
        console.error({ message: err });
    }
}


exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ where: { email } });
        if (!findUser) return res.status(401).json({ message: "User Not Found!" });

        const matchPassword = await bcrypt.compare(password, findUser.password);
        if (!matchPassword) return res.status(401).json({ message: "Invalid Credentials!" });

        // console.log("JWT_SECRET:", process.env.ACCESS_TOKEN_SECRET);

        const token = jwt.sign(
            { _id: findUser.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        )

        return res.status(200).json({ message: "Login SuccessFully!", token });

    } catch (err) {
        console.error({ message: err });
    }
}