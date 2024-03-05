const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const musicosController = require("../controllers/musicos");
const { check } = require("express-validator");
const multer = require("multer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { checkAuth } = require("../middleware/check-auth");
const FTPStorage = require("multer-ftp");

router.get("/", musicosController.traerMusicos);
router.get("/:id", musicosController.traerMusico);
router.get("/url/:url", musicosController.traerMusicoUrl);

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

// const fileUpload = multer({
//   limits: 500000,
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads/images");
//     },
//     filename: (req, file, cb) => {
//       const ext = MIME_TYPE_MAP[file.mimetype];
//       const id = crypto.randomUUID();
//       const lastIndex = file.originalname.lastIndexOf(".");
//       const fileN = file.originalname.slice(0, lastIndex);
//       const name = `${fileN}-${id}.${ext}`;
     
//       cb(null, name);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];
//     let error = isValid ? null : "invalido";
//     cb(error, isValid);
//   },
// });

const fileUpload = multer({
  limits: 500000,
  storage: new FTPStorage({
    destination: function (req, file, options, callback) {

      const ext = MIME_TYPE_MAP[file.mimetype];
      const id = crypto.randomUUID();
      const lastIndex = file.originalname.lastIndexOf(".");
      const fileN = file.originalname.slice(0, lastIndex);

      const name = `./visitantesonorouploads/imgs/perfiles/${fileN}-${id}.${ext}`;

      callback(null, name);
    },
    ftp: {
      host: process.env.ALEJO_HOST,
      secure: false, // enables FTPS/FTP with TLS
      user: process.env.ALEJO_USER,
      password: process.env.ALEJO_PASSWORD
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];

    let error = isValid ? null : "invalido";

    cb(error, isValid);
  },
})

router.use(checkAuth);

router.post(
  "/crear",
  fileUpload.single("imagen"),
  [check("nombre").not().isEmpty()],
  musicosController.crearMusico
);

router.patch(
  "/editar/:id",
  fileUpload.single("imagen"),
  [check("nombre").not().isEmpty()],
  musicosController.editarMusico
);

router.delete("/borrar/:id", musicosController.borrarMusico);

module.exports = router;
