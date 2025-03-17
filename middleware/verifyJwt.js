const db = require("../models/index");
const User = db.User;
// const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

exports.verifyUser = async (req, res, next) => {
    try {
        const authHeader = req.header("authorization") || req.header("Authorization");
        if (!authHeader?.startsWith("Bearer ")) return res.status(403).json({ message: "Unauthorize Access11!" });
        const token = authHeader.split(' ')[1];

        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.status(403).json({ message: "Invalid token" });
                const user = await User.findByPk(decoded._id);
                req.user = user;
                next();
            }

        )
    } catch (err) {
        console.error({ message: err });
    }
}