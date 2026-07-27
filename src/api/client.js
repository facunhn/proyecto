export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
