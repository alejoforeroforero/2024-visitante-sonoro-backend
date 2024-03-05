const mongoose = require("mongoose");

const tagSchema = mongoose.Schema({
  titulo: { 
    type: String, 
    required: true 
  },
  descripcion:{
    type:String,
    required:false
  },
  imagen:{
    type:String,
    required:false
  }
});

module.exports = mongoose.model('Tags', tagSchema);
