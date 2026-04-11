const bcrypt = require("bcrypt");
const Users = require("../../db/models/usersModel.js");
const { formSchema } = require("@busmate/common");

const registerUser = async (req, res) => {
  try {
    const data = await formSchema.validate(req.body, { abortEarly: true });

    //check
    const existing = await Users.query()
      .where("email", data.email)
      .orWhere("username", data.username)
      .first();

    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    //hash
    const hashed = await bcrypt.hash(data.password, 10);

    //insert user
    const newUser = await Users.query().insert({
      username: data.username,
      email: data.email,
      password: hashed,
    });

    // 3. Establish Session (Instant Authorization)
    res.cookie('userId', newUser.id, { 
       httpOnly: true, 
       maxAge: 3600000 * 24, // 24 hours
       path: '/'
    });

    return res.status(201).json({
      success: true,
      message: "Security profile established. Access granted.",
      user: { id: newUser.id, username: newUser.username, email: newUser.email },
    });
  } catch (err) {
    //validation error
    if (err?.errors?.length) {
      return res.status(422).json({ error: err.errors[0] });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = registerUser;
