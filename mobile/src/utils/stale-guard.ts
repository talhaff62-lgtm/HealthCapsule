// Tracks the latest request token. Older callers can check `isCurrent(token)`
// after their async work to decide whether to apply their result, which keeps
// out-of-order responses and post-unmount updates from leaking into state.

export function createStaleGuard() {
  let generation = 0;
  return {
    next() {
      return ++generation;
    },
    isCurrent(token: number) {
      return token === generation;
    },
    current() {
      return generation;
    },
  };
}
