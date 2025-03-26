const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

async function createLogoVariants() {
  try {
    // Ensure the output directory exists
    const outputDir = path.join(process.cwd(), 'public', 'images');
    await fs.mkdir(outputDir, { recursive: true });

    // Input file path
    const inputPath = path.join(process.cwd(), 'logo.png');

    // Define sizes
    const sizes = {
      'sm': 64,
      'md': 128,
      'lg': 256
    };

    // Create PNG variants
    for (const [name, size] of Object.entries(sizes)) {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `logo-${name}.png`));
      console.log(`Created logo-${name}.png`);
    }

    // Create favicon
    await sharp(inputPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon.png'));
    console.log('Created favicon.png');

    console.log('Logo processing completed successfully!');
  } catch (error) {
    console.error('Error processing logo:', error.message);
    if (error.code === 'ENOENT') {
      console.error('Please ensure logo.png exists in the project root directory.');
    }
  }
}

createLogoVariants(); 