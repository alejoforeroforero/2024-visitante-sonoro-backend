const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");
const grabacionController = require("../controllers/grabaciones");
// const { check } = require("express-validator");
// const multer = require("multer");
// const crypto = require("crypto");
// const { checkAuth } = require("../middleware/check-auth");
// const FTPStorage = require("multer-ftp");

//router.get("/ultimas/", grabacionController.traerUltimasGrabaciones);
router.get("/", grabacionController.traerGrabaciones);
// router.get("/:id", grabacionController.traerGrabacion);
// router.get("/url/:url", grabacionController.traerGrabacionUrl);
// router.get("/random/:id", grabacionController.traerGrabacionRandom);

//router.use(checkAuth);

const MIME_TYPE_MAP = {
  "audio/mpeg": "mp3",
  "audio/x-m4a": "m4a",
};

// const fileUpload = multer({
//   limits: 50000000,
//   storage: new FTPStorage({
//     destination: function (req, file, options, callback) {

//       const ext = MIME_TYPE_MAP[file.mimetype];
//       const id = crypto.randomUUID();
//       const lastIndex = file.originalname.lastIndexOf(".");
//       const fileN = file.originalname.slice(0, lastIndex);

//       const name = `./visitantesonorouploads/audio/${fileN}-${id}.${ext}`;

//       callback(null, name);
//     },
//     ftp: {
//       host: process.env.ALEJO_HOST,
//       secure: false, // enables FTPS/FTP with TLS
//       user: process.env.ALEJO_USER,
//       password: process.env.ALEJO_PASSWORD
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     const isValid = !!MIME_TYPE_MAP[file.mimetype];

//     let error = isValid ? null : "invalido";

//     cb(error, isValid);
//   },
// })

// router.post(
//   "/crear",
//   fileUpload.single("audio"),
//   [
//     check("titulo").not().isEmpty(),
//     check("fecha").not().isEmpty(),
//     check("lugar").not().isEmpty(),
//     check("longitud").not().isEmpty(),
//     check("latitud").not().isEmpty(),
//     check("musico").not().isEmpty(),
//   ],
//   grabacionController.crearGrabacion
// );

// router.patch(
//   "/editar/:id",
//   fileUpload.single("audio"),
//   [
//     check("titulo").not().isEmpty(),
//     check("fecha").not().isEmpty(),
//     check("lugar").not().isEmpty(),
//     check("longitud").not().isEmpty(),
//     check("latitud").not().isEmpty(),
//     check("musico").not().isEmpty(),
//   ],
//   grabacionController.editarGrabacion
// );

// router.delete("/borrar/:id", grabacionController.borrarGrabacion);

module.exports = router;
