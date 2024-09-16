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

    let name = document.getElementById("nama_lengkap").value;
    let jk = document.getElementById("jenis_kelamin").value;
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
    temLahir = toTitleCase(temLahir);
    tangLahir = formatTanggal(tangLahir);
    const lahir = `${temLahir}, ${tangLahir}`;
    wargaNegara = toTitleCase(wargaNegara);
    pekerjaan = toTitleCase(pekerjaan);
    alamat = toTitleCase(alamat);
    const tanggal = `${formatTanggal(new Date())}`;

    // Isi PDF
    await fillPDF(
      name,
      jk,
      lahir,
      wargaNegara,
      nik,
      pekerjaan,
      alamat,
      rt,
      tanggal
    );
  });

const fillPDF = async (
  name,
  jk,
  lahir,
  wargaNegara,
  nik,
  pekerjaan,
  alamat,
  rt,
  tanggal
) => {
  const { PDFDocument, rgb } = PDFLib;

  // Ambil template
  const url = "document/sktm-fil1.pdf";
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  form.getTextField("nama").setText(name);
  form.getTextField("jk").setText(jk);
  form.getTextField("ttl").setText(lahir);
  form.getTextField("warganegara").setText(wargaNegara);
  form.getTextField("nik").setText(nik);
  form.getTextField("pekerjaan").setText(pekerjaan);
  form.getTextField("alamat").setText(alamat);
  form.getTextField("rt").setText(rt);
  form.getTextField("tanggal").setText(tanggal);

  const pdfBytes = await pdfDoc.save();

  // Bikin link download
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Surat Keterangan Domisili_${name}.pdf`;
  link.click();
};
