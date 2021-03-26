"use strict";

const { join: pJoin, basename } = require("path");
const { promisify } = require("util");
const { readdir: readdirCb, writeFile: writeFileCb } = require("fs");
const easyimage = require("easyimage");

const {
  sequentialMapToPromiseAllWith,
} = require("../utils/sequentialMapToPromiseAllWith.js");
const {
  resizeToHeightAndWriteImageWith,
} = require("../utils/resizeToHeightAndWriteImage.js");

const readdir = promisify(readdirCb);
const writeFile = promisify(writeFileCb);

// CONFIGURATION

const RAW_IMG_DIR = pJoin(__dirname, "..", "raw-imgs");
const OUTPUT_DIR = "/static/images";
const LG_FILES_DIRNAME = "large";
const SM_FILES_DIRNAME = "thumbnails";
const GALLERY_CONFIG_PATH = pJoin(
  __dirname,
  "..",
  "/static/data/grid-gallery-data.json"
);
const absoluteOutputDir = pJoin(__dirname, "..", OUTPUT_DIR);

// END: CONFIGURATION

// Utility functions

// isFunction :: x -> boolean
const isFunction = (fn) => typeof fn === "function";

// filenameToPath :: string -> string -> string
const filenameToPath = (basePath) => (name) => pJoin(basePath, basename(name));

// mapToList :: [(a -> b)] -> a -> [b]
const mapToList = (...fns) => (x) => fns.map((fn) => fn(x));

// zip :: [[a], [b]] -> [[a, b]]
const zip = ([listA, listB]) =>
  listA.length > listB.length
    ? listA.map((entryA, idx) => [entryA, listB[idx]])
    : listB.map((entryB, idx) => [listA[idx], entryB]);

// Sub-functions

const log = (s) => () => console.log(s); // eslint-disable-line no-console

/*
 *
 * GalleryInput (see: react-grid-gallery documentation)
 *
 * {
 *   src: string
 *   thumbnail: string
 *   thumbnailWidth: number
 *   thumbnailHeight: number
 * }
 */

// fileInfoToGalleryInput :: string -> [InfoRecord, InfoRecord] -> GalleryInput
const fileInfoToGalleryInput = (outputDir) => ([
  lgInfoRecord,
  smInfoRecord,
]) => {
  const filenameToLgPath = filenameToPath(pJoin(outputDir, LG_FILES_DIRNAME));
  const filenameToSmPath = filenameToPath(pJoin(outputDir, SM_FILES_DIRNAME));

  return {
    src: filenameToLgPath(lgInfoRecord.name),
    thumbnail: filenameToSmPath(smInfoRecord.name),
    thumbnailWidth: smInfoRecord.width,
    thumbnailHeight: smInfoRecord.height,
  };
};

// getSourcePathsWith :: (string -> Promise<[string]>) -> string -> Promise<[string]>
const getSourcePathsWith = (readdir) => (inputDir) =>
  readdir(inputDir).then((list) => list.map(filenameToPath(inputDir)));

// convertFilesWith :: easyimage -> string -> [string] -> Promise<[[InfoRecord], [InfoRecord]]>
const convertFilesWith = (imgMethodProvider) => (outputDir) => (
  inputSrcList
) => {
  // Check imgMethods
  const { resize, info } = imgMethodProvider;
  if (!isFunction(resize) || !isFunction(info)) {
    throw new Error(
      'Image method provider not sufficient. We need "resize" and "thumbnail".'
    );
  }

  // Create mappers
  const filenameToLgPath = filenameToPath(pJoin(outputDir, LG_FILES_DIRNAME));
  const filenameToSmPath = filenameToPath(pJoin(outputDir, SM_FILES_DIRNAME));

  // makeLgPathPair :: string -> [string, string]
  const makeLgPathPair = mapToList((x) => x, filenameToLgPath);
  // makeSmPathPair :: string -> [string, string]
  const makeSmPathPair = mapToList((x) => x, filenameToSmPath);

  const lgPathPairs = inputSrcList.map(makeLgPathPair);
  const smPathPairs = inputSrcList.map(makeSmPathPair);
  return Promise.all([
    sequentialMapToPromiseAllWith(
      resizeToHeightAndWriteImageWith(imgMethodProvider)(1280)
    )(lgPathPairs),
    sequentialMapToPromiseAllWith(
      resizeToHeightAndWriteImageWith(imgMethodProvider)(180)
    )(smPathPairs),
  ]);
};

const getSourcePaths = getSourcePathsWith(readdir);
const convertFiles = convertFilesWith(easyimage);
const makeImageInfoSuitableForGallery = (data) =>
  zip(data).map(fileInfoToGalleryInput(OUTPUT_DIR));
const toJSON = (o) => JSON.stringify(o, null, 2);
const writeToDataFile = (dataString) =>
  writeFile(GALLERY_CONFIG_PATH, dataString);

// Actual executing code

getSourcePaths(RAW_IMG_DIR)
  .then(convertFiles(absoluteOutputDir))
  .then(makeImageInfoSuitableForGallery)
  .then(toJSON)
  .then(writeToDataFile)
  .then(log("Ready"));
