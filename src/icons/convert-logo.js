const sharp = require('sharp');

const sizes = [16, 48, 128];
const inputFilePath = 'logo.svg';
const outputFileName = 'logo';

sizes.forEach(size => {
  sharp(inputFilePath)
    .resize(size, size)
    .png()
    .toFile(`${outputFileName}-${size}.png`, (err, info) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`File converted: ${outputFileName}-${size}.png`);
      }
    });
});
