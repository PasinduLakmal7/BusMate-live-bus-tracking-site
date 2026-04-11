const bcrypt = require("bcrypt");
const Users = require("../../db/models/usersModel.js");

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Identify Operand
    const user = await Users.query().where("email", email).first();

    if (!user) {
      return res.status(401).json({ success: false, error: "Authentication Failure: Invalid Credentials" });
    }

    // 2. Validate Security Key
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Authentication Failure: Invalid Credentials" });
    }

    // 3. Establish Session (Demo uses session/cookies)
    // We'll set a simple cookie for this node demo
    res.cookie('userId', user.id, { 
       httpOnly: true, 
       maxAge: 3600000 * 24, // 24 hours
       path: '/'
    });

    // For the UserDashboard mock we built, let's also put it in req.session if available
    if (req.session) {
       req.session.userId = user.id;
    }

    return res.status(200).json({
      success: true,
      message: "Gateway access granted.",
      user: { id: user.id, username: user.username, email: user.email }
    });

  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, error: "Internal Security Breach: Hub Offline" });
  }
};

module.exports = loginUser;
