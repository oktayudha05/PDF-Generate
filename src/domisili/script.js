const urlBackend = "https://6ft71xh4-5000.asse.devtunnels.ms";
function formatTanggal(tanggal) {
  const bulanNama = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const tanggalObj = new Date(tanggal);
  const hari = tanggalObj.getDate();
  const bulan = bulanNama[tanggalObj.getMonth()];
  const tahun = tanggalObj.getFullYear();

  return `${hari} ${bulan} ${tahun}`;
}

function toTitleCase(str) {
  if (!str) {
    return "";
  }
  const strArr = str.split(" ").map((word) => {
    return word[0].toUpperCase() + word.substring(1).toLowerCase();
  });
  return strArr.join(" ");
}

document
  .getElementById("dataForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    let no_document = document.getElementById("no_document").value;
    let name = document.getElementById("nama_lengkap").value;
    let jk = document.getElementById("jenis_kelamin").value;
    let bin = document.getElementById("bin_binti").value;
    let agama = document.getElementById("agama").value;
    let temLahir = document.getElementById("tempat_lahir").value;
    let tangLahir = document.getElementById("tanggal_lahir").value;
    let wargaNegara = document.getElementById("warganegara").value;
    let nik = document.getElementById("no_ktp_nik").value;
    let pekerjaan = document.getElementById("pekerjaan").value;
    let alamat = document.getElementById("alamat").value;
    let rt = document.getElementById("rt").value;
    if (rt.length === 1) {
      rt = `0${rt}`;
    }

    name = toTitleCase(name);
    bin = toTitleCase(bin);
    agama = toTitleCase(agama);
    temLahir = toTitleCase(temLahir);
    tangLahir = formatTanggal(tangLahir);
    const lahir = `${temLahir}, ${tangLahir}`;
    wargaNegara = toTitleCase(wargaNegara);
    pekerjaan = toTitleCase(pekerjaan);
    alamat = toTitleCase(alamat);
    const tanggal = formatTanggal(new Date());

    // Isi PDF
    await fillPDF(
      no_document,
      name,
      jk,
      bin,
      lahir,
      agama,
      wargaNegara,
      nik,
      pekerjaan,
      alamat,
      rt,
      tanggal
    );
  });

const fillPDF = async (
  no_document,
  name,
  jk,
  bin,
  lahir,
  agama,
  wargaNegara,
  nik,
  pekerjaan,
  alamat,
  rt,
  tanggal
) => {
  const { PDFDocument, rgb } = PDFLib;

  // Ambil template
  const url = "document/Surat-Keterangan-Domisili.pdf";
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  let tinggiAwal = 278;
  let panjangAwal = 0;
  let x = 225;

  const format = () => {
    const { width, height } = firstPage.getSize();

    return {
      x: x + panjangAwal,
      y: height - tinggiAwal,
      size: 11,
      color: rgb(0, 0, 0),
    };
  };

  firstPage.drawText(name, format(), (tinggiAwal += 22));
  firstPage.drawText(jk, format(), (tinggiAwal += 22));
  firstPage.drawText(bin, format(), (tinggiAwal += 22));
  firstPage.drawText(lahir, format(), (tinggiAwal += 22));
  firstPage.drawText(agama, format(), (tinggiAwal += 22));
  firstPage.drawText(wargaNegara, format(), (tinggiAwal += 22));
  firstPage.drawText(nik, format(), (tinggiAwal += 22));
  firstPage.drawText(pekerjaan, format(), (tinggiAwal += 22));
  firstPage.drawText(alamat, format(), (tinggiAwal += 22));
  firstPage.drawText(rt, {
    x: 395,
    y: 432,
    size: 11,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(tanggal, {
    x: 454,
    y: 432,
    size: 11,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(tanggal, {
    x: 430,
    y: 284,
    size: 11,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText("Sodikun", {
    x: 418,
    y: 180,
    size: 11,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([pdfBytes], { type: "application/pdf" }),
    `Surat Keterangan Domisili_${name}.pdf`
  );
  formData.append("name", name);
  formData.append("no_document", no_document);
  formData.append("jenis_document", "Surat Keterangan Domisili");

  // Kirim ke backend menggunakan POST
  fetch(`${urlBackend}/upload`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
      alert("PDF berhasil disimpan di database");
    })
    .catch((error) => {
      console.error(error);
      alert("Gagal menyimpan PDF");
    });

  // Bikin link download
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Surat Keterangan Domisili_${name}.pdf`;
  link.click();
};
