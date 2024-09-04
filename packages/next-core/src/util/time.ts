export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitUntil(condition: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else {
        requestAnimationFrame(check);
      }
    };

    check();
  });
}

export function approximatelyEqual(a: number, b: number, tolerance: number) {
  return Math.abs(a - b) < tolerance;
}
