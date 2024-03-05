const mongoose = require("mongoose");

const musicianSchema = mongoose.Schema(
  {
    admin:{
      type:mongoose.Schema.Types.ObjectId,
      require:true,
      ref:"Admin"
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    age: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      required: [true, "Please add a url for the musician"],
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
    image: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Musician = mongoose.model("Musician", musicianSchema);
module.exports = Musician;
