const PDFParser = require("pdf2json");
const fs = require("fs");
const path = require("path");

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync("parsed_pdf.json", JSON.stringify(pdfData, null, 2));
    console.log("Written to parsed_pdf.json");
});

const pdfPath = path.join(__dirname, "public", "pedidos-exame", "TROCA_DE_INSTRUMENTO.pdf");
pdfParser.loadPDF(pdfPath);
