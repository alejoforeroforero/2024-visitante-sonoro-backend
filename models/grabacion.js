const mongoose = require("mongoose");

const grabacionSchema = mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: false,
  },
  audio:{
    type:String,
    required:true
  },
  descripcion: {
    type: String,
    required: false,
  },
  interpretes: {
    type: String,
    required: false,
  },
  fecha: {
    type: Date,
    required: false,
  },
  fechaPublicacion: {
    type: Date,
    required: true,
    default: Date.now,
  },
  lugar: {
    type: String,
    required: true,
  },
  longitud: {
    type: String,
    required: true,
  },
  latitud: {
    type: String,
    required: true,
  },
  musico: {
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref: 'Musicos'
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    required:false,
    ref: 'Categorias'
  },
  tags: {
    type: [mongoose.Schema.Types.ObjectId],
    required:false,
    ref: 'Tags'
  }
});

module.exports = mongoose.model("Grabaciones", grabacionSchema);
