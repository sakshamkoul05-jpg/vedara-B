import fs from 'fs';
import pdfjsLib from 'pdfjs-dist';

const data = new Uint8Array(fs.readFileSync('C:/Users/Hp/Downloads/WebsiteFeedback-1.pdf'));
const doc = await pdfjsLib.getDocument({data}).promise;
console.log('Pages:', doc.numPages);
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  const text = content.items.map(it => it.str).join(' ');
  console.log('--- Page ' + i + ' ---');
  console.log(text || '(no text)');
}
