import api from "./api";
export const goalService = { getAll: () => api.get("/goals"), create: (d:any) => api.post("/goals", d), contribute: (id:number, amount:number) => api.post(`/goals/${id}/contribute`, {amount}), delete: (id:number) => api.delete(`/goals/${id}`) };
