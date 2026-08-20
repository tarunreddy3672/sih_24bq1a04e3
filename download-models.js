const https = require('https');
const fs = require('fs');
const path = require('path');

const agent = new https.Agent({ rejectUnauthorized: false });
const base = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const files = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
];

function download(file) {
  return new Promise((resolve, reject) => {
    const dest = path.join(__dirname, 'public', 'models', file);
    const out = fs.createWriteStream(dest);
    https.get(base + file, { agent }, (res) => {
      res.pipe(out);
      out.on('finish', () => { out.close(); console.log('✓', file); resolve(); });
      out.on('error', reject);
    }).on('error', reject);
  });
}

(async () => {
  for (const f of files) await download(f);
  console.log('\nAll models downloaded.');
})().catch(e => { console.error(e.message); process.exit(1); });
