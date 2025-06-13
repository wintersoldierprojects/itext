const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const logoPath = path.join(__dirname, '../public/logo.png');
const iconsDir = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generating app icons from logo.png...');
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(logoPath)
        .resize(size, size, {
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 10, g: 186, b: 181, alpha: 1 } // Tiffany blue background
        })
        .png({ quality: 90 })
        .toFile(outputPath);
      
      console.log(`✅ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`❌ Error generating ${size}x${size} icon:`, error.message);
    }
  }
  
  // Generate favicon.ico (16x16 and 32x32)
  try {
    await sharp(logoPath)
      .resize(32, 32, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 10, g: 186, b: 181, alpha: 1 }
      })
      .png()
      .toFile(path.join(__dirname, '../app/favicon.ico'));
    
    console.log('✅ Generated favicon.ico');
  } catch (error) {
    console.error('❌ Error generating favicon:', error.message);
  }
  
  // Generate shortcut icons
  const shortcuts = ['chat-shortcut.png', 'admin-shortcut.png'];
  for (const shortcut of shortcuts) {
    try {
      await sharp(logoPath)
        .resize(96, 96, {
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 10, g: 186, b: 181, alpha: 1 }
        })
        .png({ quality: 90 })
        .toFile(path.join(iconsDir, shortcut));
      
      console.log(`✅ Generated ${shortcut}`);
    } catch (error) {
      console.error(`❌ Error generating ${shortcut}:`, error.message);
    }
  }
  
  console.log('🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);