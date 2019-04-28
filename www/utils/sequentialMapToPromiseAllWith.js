// sequentialMapToPromiseAllWith :: (a -> Promise<b>) -> [a] -> Promise<[b]>
const withAsyncAwait = fn =>
	async function sequentialMapToPromiseAll([head, ...tail]) {
		if (!head) {
			return Promise.resolve([])
		}
		const headResult = await fn(head)
		const tailResult = await sequentialMapToPromiseAll(tail)
		return [headResult, ...tailResult]
	}

const withNestedPromise = fn =>
	function sequentialMapToPromiseAll([head, ...tail]) {
		if (!head) {
			return Promise.resolve([])
		}
		return fn(head).then(headResult =>
			sequentialMapToPromiseAll(tail).then(tailResult => [
				headResult,
				...tailResult,
			])
		)
	}

const withLoop = fn =>
	async function sequentialMapToPromiseAll(list) {
		const result = []
		for (const elem of list) {
			result.push(await fn(elem))
		}
		return result
	}

module.exports = {
	sequentialMapToPromiseAllWith: withLoop,
	withLoop,
	withAsyncAwait,
	withNestedPromise,
}
