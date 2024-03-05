const mongoose = require("mongoose");

const musicoSchema = mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, "Please add a name"],
    trim:true 
  },
  url: { 
    type: String, 
    required: [true, "Please add a url for the musician"],
    trim:true  
  },
  descripcion:{
    type:String,
    required:false
  },
  imagen:{
    type:Object,
    default:{}
  }
});

const Musico = mongoose.model('Musicos', musicoSchema);
module.exports = Musico;

