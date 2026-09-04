const bcrypt = require("bcrypt");
const pool = require("../../db.js");
const { formSchema } = require("@busmate/common");

const registerUser = async (req, res) => {
  try {
    const data = await formSchema.validate(req.body, { abortEarly: true });

    //check
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [data.email, data.username]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    //hash
    const hashed = await bcrypt.hash(data.password, 10);

    //insert user
    const insertRes = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [data.username, data.email, hashed]
    );
    const newUser = insertRes.rows[0];

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
