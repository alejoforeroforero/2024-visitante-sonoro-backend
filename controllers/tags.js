const fs = require("fs");
const { validationResult } = require("express-validator");
const Tag = require("../models/tag");
const Grabacion = require("../models/grabacion");

async function traerTags(req, res, next) {
  const tags = await Tag.find();
  res.json(tags);
}

async function crearTag(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json("Algun campo no está bien");
    return;
  }
  const { titulo, descripcion } = req.body;

  const tag = new Tag({
    titulo,
    imagen:req.file ? req.file.path : "",
    descripcion
  });

  try {
    await tag.save();
  } catch {
    res.json("falló la creación");
  }

  res.json(tag);
}

async function editarTag(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json("Algun campo no está bien");
    return;
  }

  const id = req.params.id;

  let tagDB;

  try {
    tagDB = await Tag.findById(id);

    if (!tagDB) {
      res.json("no encontramos la categoría");

      return;
    }
  } catch (error) {
    res.json("Algo ocurrió al momento de acceder a la base de datos");

    return;
  }

  const imgA = tagDB.imagen;

  const { titulo, descripcion } = req.body;

  tagDB.titulo = titulo;
  tagDB.imagen = req.file ? req.file.path : tagDB.imagen;
  tagDB.descripcion = descripcion;

  try {
    await tagDB.save();
  } catch {
    res.json("falló la creación");
  }

  if (req.file) {
    fs.unlink(imgA, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  res.json(tagDB);
}

async function borrarTag(req, res, next) {
  const id = req.params.id;

  let tag;

  try {
    tag = await Tag.findById(id);

    if (!tag) {
      res.json("El tag ya no existe en nuestra base de datos");
    }
  } catch (error) {
    res.json("algo ocurrió al tratar de borrar");
  }

  let img = tag.imagen;

  fs.unlink(img, (err) => {
    if (err) {
      console.log(err);
    }
  });

  try {
    await Tag.findByIdAndDelete(id);
  } catch (error) {
    res.json("algo ocurrió al tratar de borrar");
  }

  res.json("se borró la categoria");
}

exports.traerTags = traerTags;
exports.crearTag = crearTag;
exports.editarTag = editarTag;
exports.borrarTag = borrarTag;
