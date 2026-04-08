import api from "./api";
import { RecurringTransaction } from "../types";

const toArray = (data: any): RecurringTransaction[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
};

export const recurringService = {
  getAll: async (): Promise<{ data: RecurringTransaction[] }> => {
    const res = await api.get<any>("/recurring");
    return { data: toArray(res.data) };
  },
  create: (d: any) => api.post("/recurring", d),
  update: (id: number, d: any) => api.put(`/recurring/${id}`, d),
  delete: (id: number) => api.delete(`/recurring/${id}`),
  processDue: () => api.post("/recurring/process-due"),
};
