const { exiftool } = require("exiftool-vendored");
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const IMG_ROOT = path.join(__dirname, "../img/");
const OUT_PATH = path.join(__dirname, "../img/exif-data.json");

(async () => {
  const images = glob.sync(`${IMG_ROOT}/**/*.{jpg,jpeg,JPG,JPEG,png,PNG}`);

  const exifData = {};

  for (const imgPath of images) {
    try {
      const metadata = await exiftool.read(imgPath);
      const key = path.relative(IMG_ROOT, imgPath).replace(/\\/g, "/");
      exifData[key] = {
        Model: metadata.Model,
        Lens: metadata.Lens,
        FNumber: metadata.FNumber,
        ISO: metadata.ISO,
        Flash: metadata.Flash,
        FocalLength: metadata.FocalLength,
        FocalLengthIn35mmFormat: metadata.FocalLengthIn35mmFormat,
        HyperfocalDistance: metadata.HyperfocalDistance,
        ExposureTime: metadata.ExposureTime,
        DateTimeOriginal: metadata.DateTimeOriginal,
        MetadataDate: metadata.MetadataDate,
      };
    } catch (e) {
      console.error(`Error reading ${imgPath}`, e);
    }
  }

  await exiftool.end();

  fs.writeFileSync(OUT_PATH, JSON.stringify(exifData, null, 2));
  console.log("✅ EXIF data written to", OUT_PATH);
})();
