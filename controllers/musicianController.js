const asyncHandler = require("express-async-handler");
const Musician = require("../models/musicianModel");
const cloudinary = require("cloudinary").v2;
const { fileSizeFormatter } = require("../utils/fileUpload");

const createMusician = asyncHandler(async (req, res) => {
  const { name, age, url, description } = req.body;

  if (!name || !url) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  const userWithUrlExists = await Musician.findOne({ url });

  if (userWithUrlExists) {
    res.status(400);
    throw new Error("url has already been registered");
  }

  let fileData = {};

  if (req.file) {
    let uploadedFile;

    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "visitantesonoro",
        resource_type: "image",
      });
    } catch {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  const musician = await Musician.create({
    admin: req.admin.id,
    name,
    age,
    url,
    description,
    image: fileData,
  });

  res.status(201).json(musician);
});

const updateMusician = asyncHandler(async (req, res) => {
  const { name, age, url, description } = req.body;
  const { id } = req.params;

  const musician = await Musician.findById(id);

  if (!musician) {
    res.status(404);
    throw new Error("Musician not found");
  }

  if (musician.admin.toString() !== req.admin.id) {
    res.status(401);
    throw new Error("User not authorized");
  }

  const userWithUrlExists = await Musician.findOne({ url });

  if (userWithUrlExists._id.toString() !== id) {
    res.status(400);
    throw new Error("url has already been registered");
  }

  let fileData = {};
  if (req.file) {
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "visitantesonoro",
        resource_type: "image",
      });
    } catch (error) {
      res.status(500);
      throw new Error("Image could not be uploaded");
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  const updatedMusician = await Musician.findByIdAndUpdate(
    { _id: id },
    {
      name,
      age,
      url,
      description,
      image: Object.keys(fileData).length === 0 ? musician?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedMusician);
});

const deleteOne = asyncHandler(async (id, adminId) => {
  try {
    const musician = await Musician.findById(id);
    if (!musician) {
      res.status(404);
      throw new Error(
        "some musicians on the list were not found, please refresh the page"
      );
    }

    if (musician.admin.toString() !== adminId) {
      res.status(401);
      throw new Error("User not authorized");
    }

    try {
      await Musician.findByIdAndDelete(id);
    } catch (error) {
      res.json("Something went wrong");
    }
  } catch (error) {
    console.log(error);
  }
});

const deleteMusician = asyncHandler(async (req, res) => {
  const list = req.params.id.split(",");
  list.forEach((id) =>  deleteOne(id, req.admin.id));
  res.status(200).json({ message: "Musicians deleted." });
});

const getMusicians = asyncHandler(async (req, res) => {
  const musicians = await Musician.find().sort("-createdAt");
  res.status(200).json(musicians);
});

const getMusician = asyncHandler(async (req, res) => {
  const musician = await Musician.findById(req.params.id);
  if (!musician) {
    res.status(404);
    throw new Error("Product not found");
  }
  // Match product to its user
  // if (product.user.toString() !== req.user.id) {
  //   res.status(401);
  //   throw new Error("User not authorized");
  // }
  res.status(200).json(musician);
});

module.exports = {
  createMusician,
  updateMusician,
  deleteMusician,
  getMusicians,
  getMusician,
};
