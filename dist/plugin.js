"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/plugin.ts
var plugin_exports = {};
__export(plugin_exports, {
  compareSnapshots: () => compareSnapshots,
  configureVisualRegression: () => configureVisualRegression,
  generateImage: () => generateImage,
  updateSnapshot: () => updateSnapshot
});
module.exports = __toCommonJS(plugin_exports);
var import_fs2 = require("fs");
var path = __toESM(require("path"));
var import_pixelmatch = __toESM(require("pixelmatch"));
var import_pngjs2 = require("pngjs");
var import_sanitize_filename = __toESM(require("sanitize-filename"));

// src/utils/image.ts
var import_fs = require("fs");
var import_pngjs = require("pngjs");

// src/utils/logger.ts
var import_winston = require("winston");
var logger = (0, import_winston.createLogger)({
  silent: process.env.visualRegressionLogger !== "true",
  level: "debug",
  format: import_winston.format.combine(import_winston.format.splat(), import_winston.format.json()),
  transports: [
    new import_winston.transports.Console({
      format: import_winston.format.combine(
        import_winston.format.timestamp({
          format: "YY-MM-DD HH:mm:ss"
        }),
        import_winston.format.label({
          label: "[LOGGER]"
        }),
        import_winston.format.simple(),
        import_winston.format.printf(
          (msg) => import_winston.format.colorize().colorize(msg.level, `${msg.timestamp} - ${msg.label}: ${msg.message}`)
        )
      )
    })
  ]
});

// src/utils/image.ts
var parseImage = async (imagePath) => {
  return await new Promise((resolve, reject) => {
    const stream = (0, import_fs.createReadStream)(imagePath);
    stream.on("error", (error) => {
      logger.error('Failed to open "%s" with message: "%s"', imagePath, error.message);
      reject(new Error(`File '${imagePath}' does not exist.`));
    });
    stream.pipe(new import_pngjs.PNG()).on("parsed", function() {
      resolve(this);
    }).on("error", (error) => {
      logger.error('Failed to parse image "%s" with message: "%s"', imagePath, error.message);
      reject(error);
    });
  });
};
var adjustCanvas = (image, width, height) => {
  if (image.width === width && image.height === height) {
    return image;
  }
  const imageAdjustedCanvas = new import_pngjs.PNG({ width, height, inputHasAlpha: true });
  import_pngjs.PNG.bitblt(image, imageAdjustedCanvas, 0, 0, image.width, image.height, 0, 0);
  return imageAdjustedCanvas;
};

// src/plugin.ts
var updateSnapshot = async (options) => {
  const toDir = options.baseDirectory ?? path.join(process.cwd(), "cypress", "snapshots", "base");
  const destDir = path.join(toDir, options.specName);
  const destFile = path.join(destDir, `${options.screenshotName}.png`);
  try {
    await import_fs2.promises.mkdir(destDir, { recursive: true });
  } catch (error) {
    logger.error(`Failed to create directory '${destDir}' with error:`, error);
    throw new Error(`cannot create directory '${destDir}'.`);
  }
  try {
    await import_fs2.promises.copyFile(options.screenshotAbsolutePath, destFile);
    logger.debug(`Updated base snapshot '${options.screenshotName}' at ${destFile}`);
    return { baseGenerated: true };
  } catch (error) {
    logger.error(`Failed to copy file '${destDir}' with error:`, error);
    throw new Error(`Failed to copy file from '${options.screenshotAbsolutePath}' to '${destFile}'.`);
  }
};
var compareSnapshots = async (options) => {
  const snapshotBaseDirectory = options.baseDirectory ?? path.join(process.cwd(), "cypress", "snapshots", "base");
  const snapshotDiffDirectory = options.diffDirectory ?? path.join(process.cwd(), "cypress", "snapshots", "diff");
  const fileName = (0, import_sanitize_filename.default)(options.screenshotName);
  const actualImage = options.screenshotAbsolutePath;
  const expectedImage = path.join(snapshotBaseDirectory, options.specName, `${fileName}.png`);
  const diffImage = path.join(snapshotDiffDirectory, options.specName, `${fileName}.png`);
  const [imgExpected, imgActual] = await Promise.all([parseImage(expectedImage), parseImage(actualImage)]);
  const diffPNG = new import_pngjs2.PNG({
    width: Math.max(imgActual.width, imgExpected.width),
    height: Math.max(imgActual.height, imgExpected.height)
  });
  const imgActualFullCanvas = adjustCanvas(imgActual, diffPNG.width, diffPNG.height);
  const imgExpectedFullCanvas = adjustCanvas(imgExpected, diffPNG.width, diffPNG.height);
  const mismatchedPixels = (0, import_pixelmatch.default)(
    imgActualFullCanvas.data,
    imgExpectedFullCanvas.data,
    diffPNG.data,
    diffPNG.width,
    diffPNG.height,
    { threshold: 0.1 }
  );
  const percentage = (mismatchedPixels / diffPNG.width / diffPNG.height) ** 0.5;
  if (percentage > options.errorThreshold) {
    logger.error('Error in visual regression found: "%s"', percentage.toFixed(2));
    if (options.generateDiff !== "never") {
      await generateImage(diffPNG, diffImage);
    }
    return {
      error: `The "${fileName}" image is different. Threshold limit exceeded!
       Expected: ${options.errorThreshold}
       Actual: ${percentage}`,
      mismatchedPixels,
      percentage
    };
  } else if (options.generateDiff === "always") {
    await generateImage(diffPNG, diffImage);
  }
  return {
    mismatchedPixels,
    percentage
  };
};
async function generateImage(diffPNG, imagePath) {
  const dirName = path.dirname(imagePath);
  try {
    await import_fs2.promises.mkdir(dirName, { recursive: true });
  } catch (error) {
    logger.error(`Failed to create directory '${dirName}' with error:`, error);
    return await Promise.reject(new Error(`cannot create directory '${dirName}'.`));
  }
  return await new Promise((resolve, reject) => {
    const file = (0, import_fs2.createWriteStream)(imagePath);
    file.on("error", (error) => {
      logger.error(`Failed to write stream '${imagePath}' with error:`, error);
      reject(new Error(`cannot create file '${imagePath}'.`));
    });
    diffPNG.pack().pipe(file).on("finish", () => {
      resolve(true);
    }).on("error", (error) => {
      logger.error(`Failed to parse image '${imagePath}' with error:`, error);
      reject(error);
    });
  });
}
var configureVisualRegression = (on) => {
  on("task", {
    compareSnapshots,
    updateSnapshot
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  compareSnapshots,
  configureVisualRegression,
  generateImage,
  updateSnapshot
});
