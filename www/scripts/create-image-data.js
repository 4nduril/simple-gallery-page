const { join: pJoin } = require('path')
const { promisify } = require('util')
const { readdir: readdirCb, writeFile: writeFileCb } = require('fs')
const easyimage = require('easyimage')

const readdir = promisify(readdirCb)
const writeFile = promisify(writeFileCb)

const RAW_IMG_DIR = pJoin(__dirname, '..', 'raw-imgs')
const OUTPUT_DIR = '/static/images'
const LG_FILES_DIRNAME = 'large'
const SM_FILES_DIRNAME = 'thumbnails'
const GALLERY_CONFIG_PATH = pJoin(
	__dirname,
	'..',
	'/utils/grid-gallery-data.json'
)

const absoluteOutputDir = pJoin(__dirname, '..', OUTPUT_DIR)

const isFunction = fn => typeof fn === 'function'
const filenameToPath = basePath => name => pJoin(basePath, name)
const mapToList = (...fns) => x => fns.map(fn => fn(x))

const log = s => () => console.log(s) // eslint-disable-line no-console

const writeResizedFiles = ({ info, resize }) => toHeight => async ([
	srcPath,
	dstPath,
]) => {
	const { width, height } = await info(srcPath)
	const widthFactor = width / height

	return resize({
		src: srcPath,
		dst: dstPath,
		height: toHeight,
		width: toHeight * widthFactor,
	})
}

// easyimage -> (string, string) -> Promise<[[lgInfoRecord], [smInfoRecord]]>
const convertFilesWith = imgMethodProvider => (inputDir, outputDir) => {
	const { resize, info } = imgMethodProvider
	if (!isFunction(resize) || !isFunction(info)) {
		throw new Error(
			'Image method provider not sufficient. We need "resize" and "thumbnail".'
		)
	}

	const filenameToSrcPath = filenameToPath(inputDir)
	const filenameToLgPath = filenameToPath(pJoin(outputDir, LG_FILES_DIRNAME))
	const filenameToSmPath = filenameToPath(pJoin(outputDir, SM_FILES_DIRNAME))

	// string -> [string, string]
	const makeLgPathPair = mapToList(filenameToSrcPath, filenameToLgPath)
	// string -> [string, string]
	const makeSmPathPair = mapToList(filenameToSrcPath, filenameToSmPath)

	return readdir(inputDir)
		.then(list => {
			const lgPathPairs = list.map(makeLgPathPair)
			const smPathPairs = list.map(makeSmPathPair)
			return Promise.all([
				sequentialMapToPromiseAllWith(
					writeResizedFiles(imgMethodProvider)(1280)
				)(lgPathPairs),
				sequentialMapToPromiseAllWith(
					writeResizedFiles(imgMethodProvider)(180)
				)(smPathPairs),
			])
		})
		.catch(e => {
			console.error(e)
			return []
		})
}

function sequentialMapToPromiseAllWith(fn) {
	return async function sequentialMapToPromiseAll([head, ...tail]) {
		if (!head) {
			return Promise.resolve([])
		}
		const headResult = await fn(head)
		const tailResult = await sequentialMapToPromiseAll(tail)
		return [headResult, ...tailResult]
	}
}

/*
 * Info record
 *
 * {
 *   path: string
 *   width: number
 *   height: number
 *   name: string
 * }
 */

const fileInfoToGalleryInput = outputDir => ([lgInfoRecord, smInfoRecord]) => {
	const filenameToLgPath = filenameToPath(pJoin(outputDir, LG_FILES_DIRNAME))
	const filenameToSmPath = filenameToPath(pJoin(outputDir, SM_FILES_DIRNAME))

	return {
		src: filenameToLgPath(lgInfoRecord.name),
		thumbnail: filenameToSmPath(smInfoRecord.name),
		thumbnailWidth: smInfoRecord.width,
		thumbnailHeight: smInfoRecord.height,
	}
}

const map = fn => as => as.map(fn)

// [[a], [b]] -> [[a, b]]
const zip = ([listA, listB]) =>
	listA.length > listB.length
		? listA.map((entryA, idx) => [entryA, listB[idx]])
		: listB.map((entryB, idx) => [listA[idx], entryB])

convertFilesWith(easyimage)(RAW_IMG_DIR, absoluteOutputDir)
	.then(zip)
	.then(map(fileInfoToGalleryInput(OUTPUT_DIR)))
	.then(o => JSON.stringify(o, null, 2))
	.then(fileContent => writeFile(GALLERY_CONFIG_PATH, fileContent))
	.then(log('Ready'))
