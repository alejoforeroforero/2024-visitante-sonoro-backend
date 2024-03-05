const asyncHandler = require("express-async-handler");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be up to 6 characters");
  }

  const adminExists = await Admin.findOne({ email });

  if (adminExists) {
    res.status(400);
    throw new Error("Email has already been registered");
  }

  const admin = await Admin.create({
    name,
    email,
    password,
  });

  if (admin) {
    const token = generateToken(admin._id);

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, photo, phone, bio } = admin;

    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginAdmin = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }

  const admin = await Admin.findOne({ email });

  if (!admin) {
    res.status(400);
    throw new Error("User not found,  please signup");
  }

  const passwordIsCorrect = await bcrypt.compare(password, admin.password);

  if (admin && passwordIsCorrect) {
    const token = generateToken(admin._id);
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + (3600000 * 24)),
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, photo, phone, bio } = admin;

    res.status(200).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
});

const logoutAdmin = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Successfully logout" });
});

const getAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (admin) {
    const { _id, name, email, photo, phone, bio } = admin;

    res.status(201).json({
      _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

const loginStatus = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
};

const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (admin) {
    const { name, email, photo, phone, bio } = admin;
    admin.email = email;
    admin.name = req.body.name || name;
    admin.phone = req.body.phone || phone;
    admin.bio = req.body.bio || bio;
    admin.photo = req.body.phot || photo;

    const updatedAdmin = await admin.save();

    res.status(200).json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.emal,
      photo: updatedAdmin.photo,
      phone: updatedAdmin.phone,
      bio: updatedAdmin.bio,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  const { oldPassword, password } = req.body;

  if (!admin) {
    res.status(400);
    throw new Error("Admin not found, please sign up");
  }

  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old a new password");
  }

  const passwordIsCorrect = await bcrypt.compare(oldPassword, admin.password);

  if (admin && passwordIsCorrect) {
    admin.password = password;
    await admin.save();
    res.status(200).send("Password change succesful");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin) {
    res.status(404);
    throw new Error("Admin does not exists");
  }

  let token = await Token.findOne({ adminId: admin._id });

  if (token) {
    await token.deleteOne();
  }

  let resetToken = crypto.randomBytes(32).toString("hex") + admin._id;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await new Token({
    adminId: admin._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000),
  }).save();

  const resetUrl = `${process.env.FRONTEND_URL}/admin/resetpassword/${resetToken}`;

  const message = `
    <h2>Hello ${admin.name} </h2>
    <p>Please use the url below to reset your password</p>
    <p>This reset link is valid for only 30 minutes</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    <p>Regards.... </p>
    <p>Visitante Sonoro</p>
  `;

  const subject = "Password Reset Request";
  const send_to = admin.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({ success: true, message: "Reset Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const adminToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!adminToken) {
    res.status(404);
    throw new Error("Invalid or expired Token");
  }

  const admin = await Admin.findOne({ _id: adminToken.adminId });
  admin.password = password;
  await admin.save();
  res.status(200).json({
    message:'Password Reset Successful, Please Login'
  })
});

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdmin,
  loginStatus,
  updateAdmin,
  changePassword,
  forgotPassword,
  resetPassword,
};
