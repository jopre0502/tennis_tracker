const fs = require('fs');
const sharp = require('sharp');

const svgContent = fs.readFileSync('icon.svg');

async function generateIcons() {
  console.log('Generating icon-192.png...');
  await sharp(svgContent)
    .resize(192, 192)
    .png()
    .toFile('icon-192.png');

  console.log('Generating icon-512.png...');
  await sharp(svgContent)
    .resize(512, 512)
    .png()
    .toFile('icon-512.png');

  console.log('✅ Icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
