const express = require('express');
const QRCode = require('qrcode');
const sharp = require('sharp');
const path = require('path');

const app = express();
app.use(express.json());

function identifyPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'generic';
}
const path = require('path');
// Map of platform to logo file paths
const logos = {
  youtube: path.join(__dirname, 'logos', 'youtube.png'),
};

async function generateQRCodeWithLogo(url, platform, fgColor, bgColor) {
  try {
    // Generate the QR code as a buffer
    const qrCodeData = await QRCode.toBuffer(url, {
      errorCorrectionLevel: 'H',
      color: { dark: fgColor || '#000000', light: bgColor || '#ffffff' },
      width: 500,
    });

    const logoPath = logos[platform];

    if (!logoPath) {
      console.warn(`No logo available for platform: ${platform}`);
      return qrCodeData; // Return QR code without a logo
    }

    // Resize the logo
    const resizedLogo = await sharp(logoPath)
      .resize({ width: 100, height: 100 }) // Adjust dimensions as needed
      .toBuffer();

    // Composite the QR code with the resized logo
    const qrWithLogo = await sharp(qrCodeData)
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toBuffer();

    return qrWithLogo;
  } catch (error) {
    console.error('Error during QR code generation:', error.message);
    throw error;
  }
}

app.post('/generate-qr', async (req, res) => {
  const { url, fgColor, bgColor } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  const platform = identifyPlatform(url);

  try {
    const qrCodeBuffer = await generateQRCodeWithLogo(url, platform, fgColor, bgColor);
    const qrCodeBase64 = `data:image/png;base64,${qrCodeBuffer.toString('base64')}`;
    res.json({ qrCode: qrCodeBase64 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.listen(5500, () => console.log('Server running on http://localhost:5500'));
