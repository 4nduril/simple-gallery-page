export const withRecursiveAsyncAwait = <T, U>(fn: (x: T) => U) =>
  async function sequentialMapToPromiseAll([head, ...tail]: Array<T>): Promise<
    Array<U>
  > {
    if (!head) {
      return Promise.resolve([]);
    }
    const headResult = await fn(head);
    const tailResult = await sequentialMapToPromiseAll(tail);
    return [headResult, ...tailResult];
  };

const withLoop = <T, U>(fn: (x: T) => U) =>
  async function sequentialMapToPromiseAll(list: Array<T>) {
    const result = [];
    for (const elem of list) {
      result.push(await fn(elem));
    }
    return result;
  };

export { withLoop as sequentialMapToPromiseAllWith };
