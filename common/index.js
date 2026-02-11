const Yup = require("yup");

// Registration schema (includes username)
const formSchema = Yup.object({
  username: Yup.string().required("Username required").min(3, "Username too short"),
  email: Yup.string().required("Email required").email("Invalid email format"),
  password: Yup.string().required("Password required").min(6, "Password too short"),
});

// Login schema (only email and password)
const loginSchema = Yup.object({
  email: Yup.string().required("Email required").email("Invalid email format"),
  password: Yup.string().required("Password required").min(6, "Password too short"),
});

module.exports = { formSchema, loginSchema };
