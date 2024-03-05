const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdmin,
  loginStatus,
  updateAdmin,
  changePassword,
  forgotPassword,
  resetPassword
} = require("../controllers/admin");
const protect = require("../middleware/authMiddleWare");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/logout", logoutAdmin);
router.get("/getadmin", protect, getAdmin);
router.get("/loggedin", loginStatus);
router.patch("/update", protect, updateAdmin);
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;
