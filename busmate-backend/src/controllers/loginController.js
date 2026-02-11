const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Users = require("../../db/models/usersModel");
const { loginSchema } = require("@busmate/common");

const handleLogin = async (req, res) => {
    try {
        const data = await loginSchema.validate(req.body);

        const user = await Users.query().where({ email: data.email }).first();

        if (!user) {
            return res.status(400).json({ status: "error", message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ status: "error", message: "Invalid email or password" });
        }

        const token = jwt.sign(
            {
                username: user.username,
                id: user.id,
            },
            process.env.JWT_SECRET,
            { expiresIn: "10h" } // Or whatever duration
        );

        res.json({ message: "Login successful", token, user });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ status: "error", message: err.errors[0] });
        }
        console.error(err);
        res.status(500).json({ status: "error", message: "Server error" });
    }
};

module.exports = handleLogin;
