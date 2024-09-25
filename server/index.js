import path from "path";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const SECRET_KEY = "secretKeyForJWT";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://localhost:27017/kelurahanDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const adminSchema = new mongoose.Schema({
  nama: String,
  jabatan: String,
  username: String,
  password: String,
});
const pdfSchema = new mongoose.Schema(
  {
    name: String,
    jenis_document: String,
    no_document: Number,
    pdfData: Buffer,
  },
  { collection: "kelurahan" }
);
const Admin = mongoose.model("Admin", adminSchema);
const Pdf = mongoose.model("Pdf", pdfSchema);

const upload = multer();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token =
    (authHeader && authHeader.split(" ")[1]) || req.cookies.authToken;

  if (token == null) {
    return res.redirect("/login");
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.render("invalidToken");
    }

    req.user = user;
    next();
  });
};

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

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, nama, jabatan } = req.body;
    const admin = await Admin.findOne({ username });
    if (admin) {
      return res.send("Username sudah ada");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      nama,
      jabatan,
      username,
      password: hashedPassword,
    });
    await newAdmin.save();
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).send("Gagal mendaftarkan admin");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

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

    res.cookie("authToken", token, { httpOnly: true });
    return res.redirect("/document");
  } catch (error) {
    console.error(error);
    res.status(500).send(`login gagal ${error.message}`);
  }
});

app.get("/document", authenticateToken, async (req, res) => {
  try {
    const pdfs = await Pdf.find({}, "name jenis_document no_document _id");
    res.render("document", { pdfs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Gagal memuat daftar PDF");
  }
});

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
