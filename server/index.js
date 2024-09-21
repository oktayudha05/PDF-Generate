import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
const PORT = 5000;
const SECRET_KEY = "secretKeyForJWT"; // Ganti dengan secret key yang kuat di lingkungan produksi

app.use(cors());
app.use(express.json()); // Untuk parsing JSON

// Setup MongoDB connection
mongoose.connect("mongodb://localhost:27017/kelurahanDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String, // Password yang akan di-hash
});

const Admin = mongoose.model("Admin", adminSchema);

// Setup skema untuk PDF
const pdfSchema = new mongoose.Schema(
  {
    name: String,
    jenis_document: String,
    no_document: Number,
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
      jenis_document: req.body.jenis_document,
      no_document: req.body.no_document,
      pdfData: pdfFile.buffer,
    });
    await newPdf.save();
    res.send("PDF berhasil disimpan!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Gagal menyimpan PDF");
  }
});

// Route untuk handle register user
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password sebelum disimpan
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();
    res.send("Admin berhasil didaftarkan!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Gagal mendaftarkan admin");
  }
});

// Route untuk handle login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).send("Username tidak ditemukan");
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).send("Password salah");
    }

    const token = jwt.sign({ adminId: admin._id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send(`login gagal ${error.message}`);
  }
});

// verifikasi JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).send("Akses ditolak, token tidak disediakan");
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send("Token tidak valid");
    }

    req.user = user;
    next();
  });
};

// Route untuk melihat daftar PDF (dilindungi dengan autentikasi)
app.get("/list", authenticateToken, async (req, res) => {
  try {
    const pdfs = await Pdf.find({}, "name jenis_document no_document _id");
    res.json(pdfs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Gagal memuat daftar PDF");
  }
});

// Route untuk mendownload PDF berdasarkan ID (juga dilindungi dengan autentikasi)
app.get("/download/:id", authenticateToken, async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).send("PDF tidak ditemukan");
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdf.jenis_document}_${pdf.name}.pdf"`,
    });

    res.send(pdf.pdfData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Gagal mendownload PDF");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
