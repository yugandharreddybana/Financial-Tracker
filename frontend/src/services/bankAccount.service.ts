import api from "./api";
import { BankAccount } from "../types";

const toArray = (data: any): BankAccount[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
};

export const bankAccountService = {
  getAll: async (): Promise<{ data: BankAccount[] }> => {
    const res = await api.get<any>("/bank-accounts");
    return { data: toArray(res.data) };
  },
  create: (payload: { name: string; icon: string; color: string; currencyCode: string; currentBalance?: number }) =>
    api.post("/bank-accounts", payload),
  delete: (id: number) => api.delete(`/bank-accounts/${id}`),
};
