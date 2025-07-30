const { exiftool } = require("exiftool-vendored");
const fs = require("fs");
const path = require("path");
const glob = require("glob");
const crypto = require("crypto");

const IMG_ROOT = path.join(__dirname, "../img/");
const OUT_PATH = path.join(__dirname, "../img/exif-data.json");
const CACHE_PATH = path.join(__dirname, "../img/.exif-cache.json");

// Generate hash of all image files for change detection
function generateImageHash(imagePaths) {
  const stats = imagePaths.map(imgPath => {
    const stat = fs.statSync(imgPath);
    return `${imgPath}:${stat.mtime.getTime()}:${stat.size}`;
  }).join('|');
  
  return crypto.createHash('md5').update(stats).digest('hex');
}

// Load existing cache
function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    }
  } catch (e) {
    console.warn('Could not load EXIF cache, will rebuild all');
  }
  return { hash: null, data: {} };
}

// Save cache
function saveCache(hash, data) {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify({ hash, data }, null, 2));
  } catch (e) {
    console.warn('Could not save EXIF cache');
  }
}

// Process images in parallel batches
async function processImagesBatch(imagePaths, batchSize = 10) {
  const results = {};
  
  for (let i = 0; i < imagePaths.length; i += batchSize) {
    const batch = imagePaths.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(imagePaths.length / batchSize)} (${batch.length} images)`);
    
    const batchPromises = batch.map(async (imgPath) => {
      try {
        const metadata = await exiftool.read(imgPath);
        const key = path.relative(IMG_ROOT, imgPath).replace(/\\/g, "/");
        
        return {
          key,
          data: {
            Model: metadata.Model,
            Lens: metadata.Lens,
            FNumber: metadata.FNumber,
            ISO: metadata.ISO,
            FocalLength: metadata.FocalLength,
            FocalLengthIn35mmFormat: metadata.FocalLengthIn35mmFormat,
            ExposureTime: metadata.ExposureTime,
            DateTimeOriginal: metadata.DateTimeOriginal,
            MetadataDate: metadata.MetadataDate,
          }
        };
      } catch (e) {
        console.error(`Error reading ${imgPath}`, e);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(result => {
      if (result) {
        results[result.key] = result.data;
      }
    });
  }
  
  return results;
}

(async () => {
  const startTime = Date.now();
  console.log('🔍 Checking for image changes...');
  
  const images = glob.sync(`${IMG_ROOT}/**/*.{jpg,jpeg,JPG,JPEG,png,PNG}`);
  console.log(`Found ${images.length} images`);
  
  // Generate current hash
  const currentHash = generateImageHash(images);
  
  // Load existing cache
  const cache = loadCache();
  
  // Check if we need to rebuild
  if (cache.hash === currentHash && fs.existsSync(OUT_PATH)) {
    console.log('✅ No image changes detected, using cached EXIF data');
    console.log(`⚡ Completed in ${Date.now() - startTime}ms`);
    return;
  }
  
  console.log('📸 Processing EXIF data...');
  
  // Check which images are new or changed
  let imagesToProcess = images;
  let exifData = {};
  
  if (cache.hash && cache.data) {
    console.log('🔄 Incremental update detected');
    exifData = { ...cache.data };
    
    // Only process images that don't exist in cache or might have changed
    imagesToProcess = images.filter(imgPath => {
      const key = path.relative(IMG_ROOT, imgPath).replace(/\\/g, "/");
      return !cache.data[key];
    });
    
    console.log(`Processing ${imagesToProcess.length} new/changed images (${images.length - imagesToProcess.length} from cache)`);
  }
  
  if (imagesToProcess.length > 0) {
    const newExifData = await processImagesBatch(imagesToProcess);
    exifData = { ...exifData, ...newExifData };
  }

  await exiftool.end();

  // Write output file
  fs.writeFileSync(OUT_PATH, JSON.stringify(exifData, null, 2));
  
  // Save cache
  saveCache(currentHash, exifData);
  
  const duration = Date.now() - startTime;
  console.log(`✅ EXIF data written to ${OUT_PATH}`);
  console.log(`⚡ Completed in ${duration}ms (${(duration / 1000).toFixed(1)}s)`);
  console.log(`📊 Processed ${Object.keys(exifData).length} images total`);
})();
