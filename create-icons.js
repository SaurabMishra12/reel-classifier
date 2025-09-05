const fs = require('fs');
const { createCanvas } = require('canvas');

// Create icon.png
function createIcon() {
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#4a86e8';
  ctx.fillRect(0, 0, 1024, 1024);

  // Circle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(512, 512, 350, 0, Math.PI * 2);
  ctx.fill();

  // Play triangle
  ctx.fillStyle = '#4a86e8';
  ctx.beginPath();
  ctx.moveTo(400, 400);
  ctx.lineTo(624, 512);
  ctx.lineTo(400, 624);
  ctx.closePath();
  ctx.fill();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./assets/icon.png', buffer);
  console.log('Created icon.png');
}

// Create splash.png
function createSplash() {
  const canvas = createCanvas(1242, 2436);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1242, 2436);

  // Circle
  ctx.fillStyle = '#4a86e8';
  ctx.beginPath();
  ctx.arc(621, 1000, 200, 0, Math.PI * 2);
  ctx.fill();

  // Play triangle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(550, 900);
  ctx.lineTo(700, 1000);
  ctx.lineTo(550, 1100);
  ctx.closePath();
  ctx.fill();

  // Text
  ctx.fillStyle = '#4a86e8';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Reel Classifier', 621, 1300);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./assets/splash.png', buffer);
  console.log('Created splash.png');
}

// Create adaptive-icon.png
function createAdaptiveIcon() {
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#4a86e8';
  ctx.fillRect(0, 0, 1024, 1024);

  // Circle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(512, 512, 400, 0, Math.PI * 2);
  ctx.fill();

  // Play triangle
  ctx.fillStyle = '#4a86e8';
  ctx.beginPath();
  ctx.moveTo(400, 400);
  ctx.lineTo(624, 512);
  ctx.lineTo(400, 624);
  ctx.closePath();
  ctx.fill();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./assets/adaptive-icon.png', buffer);
  console.log('Created adaptive-icon.png');
}

// Create favicon.png
function createFavicon() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#4a86e8';
  ctx.fillRect(0, 0, 48, 48);

  // Circle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(24, 24, 16, 0, Math.PI * 2);
  ctx.fill();

  // Play triangle
  ctx.fillStyle = '#4a86e8';
  ctx.beginPath();
  ctx.moveTo(18, 18);
  ctx.lineTo(30, 24);
  ctx.lineTo(18, 30);
  ctx.closePath();
  ctx.fill();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('./assets/favicon.png', buffer);
  console.log('Created favicon.png');
}

// Create all icons
createIcon();
createSplash();
createAdaptiveIcon();
createFavicon();