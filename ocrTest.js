import Tesseract from "tesseract.js";

Tesseract.recognize(
  "https://tesseract.projectnaptha.com/img/eng_bw.png", // sample image with text
  "eng",
  { logger: (m) => console.log(m) } // logs progress
).then(({ data: { text } }) => {
  console.log("Extracted text:", text);
});
