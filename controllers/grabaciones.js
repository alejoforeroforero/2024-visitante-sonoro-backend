const mongoose = require("mongoose");
// const fs = require("fs");
// const { validationResult } = require("express-validator");
const Grabacion = require("../models/grabacion");
const Musico = require("../models/musico");
const Categoria = require("../models/categoria");
const Tag = require("../models/tag");
// const { crearFriendlyUrl } = require("../middleware/friendly-url");

async function traerGrabaciones(req, res, next) {
  const grabaciones = await Grabacion.find({});
  const musicos = await Musico.find({});
  const categorias = await Categoria.find({});
  const tags = await Tag.find({});

  const info = {
    musicos,
    grabaciones,
    categorias,
    tags,
  };

  res.json(info);
}

async function traerUltimasGrabaciones(req, res, next) {
  const grabaciones = await Grabacion.find().sort({ _id: -1 }).limit(8);

  const musicos = await Musico.find({});
  const categorias = await Categoria.find({});
  const tags = await Tag.find({});

  const info = {
    musicos,
    grabaciones,
    categorias,
    tags,
  };

  res.json(info);
}

async function traerGrabacion(req, res, next) {
  const id = req.params.id;

  let grabacion;

  if (id == "0") {
    try {
      let n = await Grabacion.count();

      let nR = Math.floor(Math.random() * n);

      grabacion = await Grabacion.findOne().skip(nR);
    } catch (error) {
      res.json(false);
      return;
    }
  } else {
    try {
      grabacion = await Grabacion.findById(id);
    } catch (error) {
      res.json(false);
      return;
    }
  }

  if (!grabacion) {
    const respuesta = {
      error: true,
      mensaje: `La grabación no se ha encontrado`,
    };
    res.json(respuesta);
    return;
  }

  const musicos = await Musico.find({});
  const categorias = await Categoria.find({});
  const tags = await Tag.find({});

  const info = {
    musicos,
    grabacion,
    categorias,
    tags,
  };

  res.json(info);
}

async function traerGrabacionUrl(req, res, next) {
  const url = req.params.url;

  let grabacionR;

  try {
    grabacionR = await Grabacion.find({ url: url });
  } catch (error) {
    const respuesta = {
      error: true,
      mensaje: `Ha ocurrido un error en la conexión`,
    };
    res.json(respuesta);
    return;
  }

  if (!grabacionR) {
    const respuesta = {
      error: true,
      mensaje: `La grabación no se ha encontrado`,
    };
    res.json(respuesta);
    return;
  }

  const grabacion = grabacionR[0];

  let musico, categoria, grabacionesCategoria, grabacionesMusico

  try{  
    musico = await Musico.findById(grabacion.musico);

    categoria = await Categoria.findById(grabacion.categoria);
    //const tags = await Tag.findById({});
  
    grabacionesCategoria = await Grabacion.find({
      categoria: categoria._id,
    });
    grabacionesMusico = await Grabacion.find({ musico: musico.id });
  }catch(error){
    console.log(error);
  }

  if(!musico || !categoria || !grabacionesCategoria || !grabacionesMusico){
    console.log("pailas");
    return;
  }
  

  const info = {
    musico,
    grabacion,
    categoria,
    grabacionesCategoria,
    grabacionesMusico,
    //tags,
  };

  res.json(info);
}

async function traerGrabacionRandom(req, res, next) {
  let grabacion;

  try {
    let n = await Grabacion.count();
    let nR = Math.floor(Math.random() * n);
    grabacion = await Grabacion.findOne().skip(nR);
  } catch (error) {
    res.json(false);
    return;
  }

  if (!grabacion) {
    const respuesta = {
      error: true,
      mensaje: `La grabación no se ha encontrado`,
    };
    res.json(respuesta);
    return;
  }

  const musico = await Musico.findById(grabacion.musico);

  const categoria = await Categoria.findById(grabacion.categoria);
  //const tags = await Tag.findById({});

  const info = {
    musico,
    grabacion,
    categoria,
    //tags,
  };

  res.json(info);
}

async function crearGrabacion(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json("Algun campo no está bien");
    return;
  }

  const {
    titulo,
    descripcion,
    interpretes,
    fecha,
    fechaPublicacion,
    lugar,
    longitud,
    latitud,
    musico,
    categoria,
    tags,
  } = req.body;

  const urlString = crearFriendlyUrl(titulo);

  let existeUrl;

  try {
    existeUrl = await Grabacion.find({ url: urlString });
  } catch (error) {
    const respuesta = {
      error: true,
      mensaje: `Algo ocurrio en la base de datos: ${error.message}`,
    };
    res.json(respuesta);
  }

  if (existeUrl.length > 0) {
    const respuesta = {
      error: true,
      mensaje: `ya existe una grabacion con ese nombre`,
    };
    res.json(respuesta);

    // fs.unlink(req.file.path, (err) => {
    //   if (err) {
    //     console.log(err);
    //   }
    // });

    return;
  }

  let tagsDB = JSON.parse(tags);
  let fechaDB = JSON.parse(fecha);

  const grabacion = await new Grabacion({
    titulo,
    url: urlString,
    descripcion,
    interpretes,
    fecha: fechaDB,
    fechaPublicacion,
    lugar,
    longitud,
    latitud,
    musico,
    categoria,
    tags: tagsDB,
    audio: req.file.path,
  });

  try {
    await grabacion.save();
  } catch {
    res.json("falló la creación de la grabación");
    return;
  }

  res.json(grabacion);
}

async function editarGrabacion(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json("Algun campo no está bien");
    return;
  }

  const id = req.params.id;

  const {
    titulo,
    descripcion,
    interpretes,
    fecha,
    lugar,
    longitud,
    latitud,
    musico,
    categoria,
    tags,
  } = req.body;

  const urlString = crearFriendlyUrl(titulo);

  let grabacionConUrl;

  try {
    grabacionConUrl = await Grabacion.find({ url: urlString });
  } catch (error) {
    const respuesta = {
      error: true,
      mensaje: `Algo ocurrio en la base de datos: ${error.message}`,
    };
    res.json(respuesta);
  }

  if (grabacionConUrl.length > 0) {
    if (grabacionConUrl[0]._id != req.params.id) {
      const respuesta = {
        error: true,
        mensaje: `ya existe una grabación con ese nombre`,
      };
      res.json(respuesta);

      return;
    }
  }

  let tagsDB = JSON.parse(tags);
  let fechaDB = JSON.parse(fecha);

  let grabacion;

  try {
    grabacion = await Grabacion.findById(id);

    if (!grabacion) {
      res.json("no encontramos la grabación");
      return;
    }
  } catch (e) {
    res.json("Algo ocurrió al momento de acceder a la base de datos");
    return;
  }

  const audioA = grabacion.audio;

  grabacion.titulo = titulo;
  grabacion.url = urlString;
  grabacion.descripcion = descripcion;
  grabacion.interpretes = interpretes;
  grabacion.fecha = fechaDB;
  grabacion.lugar = lugar;
  grabacion.longitud = longitud;
  grabacion.latitud = latitud;
  grabacion.musico = musico;
  grabacion.categoria = categoria;
  grabacion.tags = tagsDB;
  grabacion.audio = req.file ? req.file.path : grabacion.audio;

  try {
    await grabacion.save();
  } catch {
    res.json("falló la creación de la grabación");
    return;
  }

  // if (req.file) {
  //   fs.unlink(audioA, (err) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  // }

  res.json(grabacion);
}

async function borrarGrabacion(req, res, next) {
  const id = req.params.id;

  let grabacion;

  try {
    grabacion = await Grabacion.findById(id);

    if (!grabacion) {
      res.json("La grabación ya no existe en la base de datos");
    }
  } catch (error) {
    console.log(error);
    res.json("Algo ocurrió al tratar de borrar");
  }

  const audio = grabacion.audio;

  // fs.unlink(audio, (err) => {
  //   if (err) {
  //     console.log(err);
  //   }
  // });

  try {
    await Grabacion.findByIdAndDelete(id);
  } catch (error) {
    res.json("algo ocurrió al tratar de borrar");
  }

  res.json("se borró la grabación");
}

exports.traerGrabaciones = traerGrabaciones;
exports.traerUltimasGrabaciones = traerUltimasGrabaciones;
exports.crearGrabacion = crearGrabacion;
exports.traerGrabacionUrl = traerGrabacionUrl;
exports.traerGrabacionRandom = traerGrabacionRandom;
exports.traerGrabacion = traerGrabacion;
exports.editarGrabacion = editarGrabacion;
exports.borrarGrabacion = borrarGrabacion;
