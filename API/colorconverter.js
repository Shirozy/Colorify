import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const mimeType = allowedTypes.test(file.mimetype);
    if (mimeType) {
      return cb(null, true);
    } else {
      return cb(new Error('Invalid file type'), false);
    }
  }
});

const jobQueue = [];
const jobResults = {};

function getOutputPath(jobId) {
  return path.join(__dirname, 'output', `${jobId}.png`);
}

async function convertImage(job) {
  const { filePath, jobId, palette, blend } = job;

  try {
    const outputFilePath = getOutputPath(jobId);

    // Load the image
    const img = await loadImage(filePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Convert image to selected palette
    const convertedData = convertImageToPalette(imageData, palette, blend);
    ctx.putImageData(convertedData, 0, 0);

    // Save the processed image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputFilePath, buffer);

    // Delete the original file after processing
    fs.unlinkSync(filePath);

    // Store the result
    jobResults[jobId] = { outputPath: outputFilePath };
    return { outputPath: outputFilePath };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Image processing failed');
  }
}

async function processJobs() {
  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    try {
      await convertImage(job);
    } catch (error) {
      console.error('Job failed:', error);
    }
  }
}

setInterval(processJobs, 1000);

// Helper functions for color conversion
function colorDifference(color1, color2) {
  return Math.abs(color1[0] - color2[0]) + Math.abs(color1[1] - color2[1]) + Math.abs(color1[2] - color2[2]);
}

function getClosestColor(color, palette) {
  let minDiff = Infinity;
  let closestColor = palette[0];
  palette.forEach(paletteColor => {
    const paletteRgb = hexToRgb(paletteColor);
    const diff = colorDifference(color, paletteRgb);
    if (diff < minDiff) {
      minDiff = diff;
      closestColor = paletteRgb;
    }
  });
  return closestColor;
}

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255];
}

function convertImageToPalette(imageData, palette, blend = false) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    let closestColor = getClosestColor([r, g, b], palette);

    if (blend) {
      closestColor = [(r + closestColor[0]) / 5, (g + closestColor[1]) / 5, (b + closestColor[2]) / 5];
    }

    [data[i], data[i + 1], data[i + 2]] = closestColor;
  }
  return imageData;
}

app.post('/v1/convert-async', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'You need to provide a valid image file' });
    }

    const { colors } = req.body;
    if (!colors) {
      return res.status(400).json({ error: 'You need to provide a color palette' });
    }

    const jobId = uuidv4();
    const filePath = req.file.path;

    const palette = colors.split(',').map(color => color.trim());
    
    // Add job to queue with palette
    jobQueue.push({ jobId, filePath, palette });

    res.status(200).json({ jobId });
  } catch (error) {
    console.error('Error in /v1/convert-async:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/v1/job-status/:jobId', async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const result = jobResults[jobId];

    if (!result) {
      return res.status(404).json({ error: 'Job not found or still processing' });
    }

    return res.json({ status: 'completed', result: { outputPath: path.resolve(result.outputPath) } });

  } catch (error) {
    console.error('Error in /v1/job-status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
