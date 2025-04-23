export function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      if (cookie.startsWith(name + "=")) {
        return decodeURIComponent(cookie.split("=")[1]);
      }
    }
    return null;
  }
  