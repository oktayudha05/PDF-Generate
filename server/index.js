import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 5000;

app.use(cors());

// Setup MongoDB connection
mongoose.connect("mongodb://localhost:27017/kelurahanDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const pdfSchema = new mongoose.Schema(
  {
    name: String,
    pdfData: Buffer,
  },
  { collection: "kelurahan" }
);

const Pdf = mongoose.model("Pdf", pdfSchema);

// Middleware untuk parsing form-data dengan file upload
const upload = multer();

// Route untuk handle upload PDF
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const pdfFile = req.file;
    const newPdf = new Pdf({
      name: req.body.name,
      pdfData: pdfFile.buffer,
    });
    await newPdf.save();
    res.send("PDF berhasil disimpan!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Gagal menyimpan PDF");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
