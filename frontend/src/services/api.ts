import axios from "axios";
const api = axios.create({ baseURL: "/api", timeout: 30000 });
api.interceptors.request.use(cfg => { const t = localStorage.getItem("token"); if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg; });
api.interceptors.response.use(
	r => r,
	err => {
		if (err.response?.status === 401) {
			const requestUrl = String(err.config?.url || "");
			const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

			if (!isAuthRequest) {
				localStorage.removeItem("token");
				localStorage.removeItem("user");
				if (window.location.pathname !== "/login") window.location.href = "/login";
			}
		}
		return Promise.reject(err);
	}
);
export default api;
