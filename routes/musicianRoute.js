const express = require("express");
const router = express.Router();
const { createMusician, updateMusician, deleteMusician, getMusicians, getMusician } = require("../controllers/musicianController");
const protect = require("../middleware/authMiddleWare");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createMusician);
router.patch("/:id", protect, upload.single("image"), updateMusician);
router.get("/", getMusicians);
router.get("/:id", getMusician);
router.delete("/:id", protect, deleteMusician);

module.exports = router;