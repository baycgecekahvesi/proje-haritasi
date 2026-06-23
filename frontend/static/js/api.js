// Merkezi fetch sarmalayıcı — JWT ekler, 401'de otomatik çıkış yapar.
const API = (() => {
  const BASE = "/api";
  const TOKEN_KEY = "ph_token";

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
  const clearToken = () => localStorage.removeItem(TOKEN_KEY);

  async function request(path, { method = "GET", body, isForm = false, auth = true } = {}) {
    const headers = {};
    if (auth && getToken()) headers["Authorization"] = `Bearer ${getToken()}`;

    let payload = body;
    if (body && !isForm) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }

    const res = await fetch(`${BASE}${path}`, { method, headers, body: payload });

    if (res.status === 401 && path !== "/auth/login") {
      clearToken();
      window.dispatchEvent(new CustomEvent("auth:expired"));
      throw new Error("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
    }

    let data = null;
    const text = await res.text();
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }

    if (!res.ok) {
      const detail = (data && data.detail) || "İşlem başarısız oldu";
      throw new Error(detail);
    }
    return data;
  }

  return {
    getToken, setToken, clearToken,
    get: (p) => request(p),
    post: (p, body) => request(p, { method: "POST", body }),
    patch: (p, body) => request(p, { method: "PATCH", body }),
    put:   (p, body) => request(p, { method: "PUT", body }),
    del: (p) => request(p, { method: "DELETE" }),
    postForm: (p, formData) => request(p, { method: "POST", body: formData, isForm: true }),
    login: (username, password) =>
      request("/auth/login", { method: "POST", body: { username, password }, auth: false }),
  };
})();
