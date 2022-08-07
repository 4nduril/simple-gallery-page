import { join as pJoin, basename } from "path";
import { readdir, writeFile } from "fs/promises";
import { info, resize } from "easyimage";

import { sequentialMapToPromiseAllWith } from "../utils/sequentialMapToPromiseAllWith";
import {
  InfoRecord,
  resizeToHeightAndWriteImageWith,
} from "../utils/resizeToHeightAndWriteImage";

// CONFIGURATION

const RAW_IMG_DIR = pJoin(__dirname, "..", "raw-imgs");
const OUTPUT_DIR = "/images";
const LG_FILES_DIRNAME = "large";
const SM_FILES_DIRNAME = "thumbnails";
const GALLERY_CONFIG_PATH = pJoin(
  __dirname,
  "..",
  "/public/data/grid-gallery-data.json"
);
const absoluteOutputDir = pJoin(__dirname, "..", "public/", OUTPUT_DIR);

// END: CONFIGURATION

// Utility functions

const filenameToPath = (basePath: string) => (name: string) =>
  pJoin(basePath, basename(name));

const mapToList =
  <T, U>(...fns: Array<(x: T) => U>) =>
  (x: T) =>
    fns.map((fn) => fn(x));

const zip = <T, U>([listA, listB]: [Array<T>, Array<U>]) =>
  listA.length > listB.length
    ? listA.map((entryA, idx) => [entryA, listB[idx]] as const)
    : listB.map((entryB, idx) => [listA[idx], entryB] as const);

// Sub-functions

const log = (s: string) => () => console.log(s); // eslint-disable-line no-console

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
const fileInfoToGalleryInput =
  (outputDir: string) =>
  ([lgInfoRecord, smInfoRecord]: readonly [InfoRecord, InfoRecord]) => {
    const filenameToLgPath = filenameToPath(pJoin(outputDir, LG_FILES_DIRNAME));
    const filenameToSmPath = filenameToPath(pJoin(outputDir, SM_FILES_DIRNAME));

    return {
      src: filenameToLgPath(lgInfoRecord.name),
      thumbnail: filenameToSmPath(smInfoRecord.name),
      thumbnailWidth: smInfoRecord.width,
      thumbnailHeight: smInfoRecord.height,
    };
  };

const getSourcePathsWith = (dirReader: typeof readdir) => (inputDir: string) =>
  dirReader(inputDir).then((list) => list.map(filenameToPath(inputDir)));

// convertFilesWith :: easyimage -> string -> [string] -> Promise<[[InfoRecord], [InfoRecord]]>
const convertFilesWith =
  (imgMethodProvider: { info: typeof info; resize: typeof resize }) =>
  (outputDir: string) =>
  (inputSrcList: Array<string>) => {
    // Create mappers
    const filenameToLgPath = filenameToPath(pJoin(outputDir, LG_FILES_DIRNAME));
    const filenameToSmPath = filenameToPath(pJoin(outputDir, SM_FILES_DIRNAME));

    // makeLgPathPair :: string -> [string, string]
    const makeLgPathPair = mapToList((x: string) => x, filenameToLgPath);
    // makeSmPathPair :: string -> [string, string]
    const makeSmPathPair = mapToList((x: string) => x, filenameToSmPath);

    const lgPathPairs = inputSrcList.map(makeLgPathPair);
    const smPathPairs = inputSrcList.map(makeSmPathPair);
    return Promise.all([
      sequentialMapToPromiseAllWith(
        resizeToHeightAndWriteImageWith(imgMethodProvider)(1280)
      )(lgPathPairs as Array<[string, string]>),
      sequentialMapToPromiseAllWith(
        resizeToHeightAndWriteImageWith(imgMethodProvider)(180)
      )(smPathPairs as Array<[string, string]>),
    ]);
  };

const getSourcePaths = getSourcePathsWith(readdir);
const convertFiles = convertFilesWith({ resize, info });
const makeImageInfoSuitableForGallery = (
  data: [Array<InfoRecord>, Array<InfoRecord>]
) => zip(data).map(fileInfoToGalleryInput(OUTPUT_DIR));
const toJSON = (o: unknown) => JSON.stringify(o, null, 2);
const writeToDataFile = (dataString: string) =>
  writeFile(GALLERY_CONFIG_PATH, dataString);

// Actual executing code

getSourcePaths(RAW_IMG_DIR)
  .then(convertFiles(absoluteOutputDir))
  .then(makeImageInfoSuitableForGallery)
  .then(toJSON)
  .then(writeToDataFile)
  .then(log("Ready"))
  // eslint-disable-next-line
  .catch(console.error);
