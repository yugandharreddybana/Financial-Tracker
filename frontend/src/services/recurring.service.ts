import api from "./api";
export const recurringService = { getAll: () => api.get("/recurring"), create: (d:any) => api.post("/recurring", d), delete: (id:number) => api.delete(`/recurring/${id}`), processDue: () => api.post("/recurring/process-due") };
