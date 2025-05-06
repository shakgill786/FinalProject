export function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [k, v] = cookie.split("=");
    if (k === name) return decodeURIComponent(v);
  }
  return null;
}