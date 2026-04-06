import api from "./api";
import { SavingsGoal } from "../types";

const toArray = (data: any): SavingsGoal[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
};

export const goalService = {
  getAll: async (): Promise<{ data: SavingsGoal[] }> => {
    const res = await api.get<any>("/goals");
    return { data: toArray(res.data) };
  },
  create: (d: any) => api.post("/goals", d),
  delete: (id: number) => api.delete(`/goals/${id}`),
  contribute: (id: number, amount: number) =>
    api.post(`/goals/${id}/contribute`, { amount }),
};
