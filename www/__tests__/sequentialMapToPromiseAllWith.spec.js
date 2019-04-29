const {
	sequentialMapToPromiseAllWith,
	withRecursiveNestedPromise,
	withLoop,
	withRecursiveAsyncAwait,
	withReduce,
} = require('../utils/sequentialMapToPromiseAllWith.js')

describe('sequentialMapToPromiseAllWith', () => {
	it('is a function', () => {
		expect(typeof sequentialMapToPromiseAllWith).toBe('function')
	})
	it('takes a function and an array and returns a Promise of a mapped array', async () => {
		const fn = x => Promise.resolve(x + 1)
		const list = [1, 2, 3]
		const result = await sequentialMapToPromiseAllWith(fn)(list)
		expect(result).toEqual([2, 3, 4])
	})
	it('works with nested "then"', async () => {
		const fn = x => Promise.resolve(x + 1)
		const list = [1, 2, 3]
		const result = await withRecursiveNestedPromise(fn)(list)
		expect(result).toEqual([2, 3, 4])
	})
	it('works as loop', async () => {
		const fn = x => Promise.resolve(x + 1)
		const list = [1, 2, 3]
		const result = await withLoop(fn)(list)
		expect(result).toEqual([2, 3, 4])
	})
	it('works with async/await', async () => {
		const fn = x => Promise.resolve(x + 1)
		const list = [1, 2, 3]
		const result = await withRecursiveAsyncAwait(fn)(list)
		expect(result).toEqual([2, 3, 4])
	})
	it('works with reduce', async () => {
		const fn = x => Promise.resolve(x + 1)
		const list = [1, 2, 3]
		const result = await withReduce(fn)(list)
		expect(result).toEqual([2, 3, 4])
	})
})
