const asyncHandler = require("express-async-handler");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
    }

    const verfied = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(verfied.id).select("password");

    if (!admin) {
      res.status(401);
      throw new Error("User not found");
    }

    req.admin = admin;

    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }
});

module.exports = protect;
