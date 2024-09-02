document.getElementById('dataForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('nama_lengkap').value;
  const jk = document.getElementById('jenis_kelamin').value;
  const bin = document.getElementById('bin_binti').value;
  const agama = document.getElementById('agama').value;
  const temLahir = document.getElementById('tempat_lahir').value; 
  const tangLahir = document.getElementById('tanggal_lahir').value; 
  const lahir = `${temLahir}, ${tangLahir}`;
  // Isi PDF
  await fillPDF(name, jk, bin, lahir, agama);
});

const fillPDF = async (name, jk, bin, lahir, agama) => {
  const { PDFDocument, rgb } = PDFLib;

  // Ambil template
  const url = 'document/tes.pdf';
  const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  let tinggiAwal = 211

  const { width, height } = firstPage.getSize();
  firstPage.drawText(name, {
    x: 220,
    y: height - tinggiAwal,
    size: 11,
    color: rgb(0, 0, 0)
  }, tinggiAwal += 15);

  firstPage.drawText(jk, {
    x: 220,
    y: height - tinggiAwal,
    size: 11,
    color: rgb(0, 0, 0)
  }, tinggiAwal += 15);

  firstPage.drawText(bin, {
    x: 220,
    y: height - tinggiAwal,
    size: 11,
    color: rgb(0, 0, 0)
  }, tinggiAwal += 15);

  firstPage.drawText(lahir, {
    x: 220,
    y: height - tinggiAwal,
    size: 11,
    color: rgb(0, 0, 0)
  }, tinggiAwal += 15);
  
  firstPage.drawText(agama, {
    x: 220,
    y: height - tinggiAwal,
    size: 11,
    color: rgb(0, 0, 0)
  }, tinggiAwal += 15);
  const pdfBytes = await pdfDoc.save();

  // Bikin link download
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `result/tes_form_${name}.pdf`;
  link.click();
}
