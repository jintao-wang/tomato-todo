export function debounce(fn, ms, immediate = false) {
  let timer = null;

  return function (...args) {
    const callNow = immediate && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) return fn.apply(this, args);
    }, ms);
    if (callNow) fn.apply(this, args);
  }
}
