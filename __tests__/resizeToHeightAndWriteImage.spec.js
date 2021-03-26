jest.mock('easyimage')
const easyimage = require('easyimage')

const {
	resizeToHeightAndWriteImageWith,
	convertDimensionsTo,
} = require('../utils/resizeToHeightAndWriteImage.js')

describe('resizeToHeightAndWriteImage', () => {
	describe('image dimensions converter', () => {
		it('takes target height and dimensions and returns new dimensions with target height', () => {
			const targetHeight = 1024

			const srcDimsLandscape = {
				width: 4640,
				height: 3480,
			}
			const srcDimsPortrait = {
				width: 3480,
				height: 4640,
			}
			const expectedLandscape = {
				width: 1365,
				height: 1024,
			}
			const expectedPortrait = {
				width: 768,
				height: 1024,
			}
			const convertDimensions = convertDimensionsTo(targetHeight)
			expect(convertDimensions(srcDimsLandscape)).toEqual(expectedLandscape)
			expect(convertDimensions(srcDimsPortrait)).toEqual(expectedPortrait)
		})
	})
	describe('integration with easyimage', () => {
		it('calls resize with correct paths and dimensions', async () => {
			easyimage.info.mockResolvedValue({
				width: 4640,
				height: 3480,
			})
			const targetHeight = 1024
			const paths = ['src/myImage.jpg', 'dst/myImage.jpg']
			const resizeToHeightAndWriteImage = resizeToHeightAndWriteImageWith(
				easyimage
			)(targetHeight)

			const expected = {
				src: paths[0],
				dst: paths[1],
				height: targetHeight,
				width: 1365,
			}

			await resizeToHeightAndWriteImage(paths)
			expect(easyimage.resize).toHaveBeenCalledWith(expected)
		})
	})
})
