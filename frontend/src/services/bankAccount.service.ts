import api from "./api";
import { BankAccount, CurrencyEntry } from "../types";

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
  create: (payload: { name: string; icon: string; color: string; currencyId: number; currentBalance?: number; isCreditCard?: boolean; creditLimit?: number }) =>
    api.post("/bank-accounts", payload),
  delete: (id: number) => api.delete(`/bank-accounts/${id}`),
  payBill: (id: number, amount: number) => api.post(`/bank-accounts/${id}/pay-bill`, { amount }),
  getCurrencies: async (): Promise<CurrencyEntry[]> => {
    const res = await api.get<CurrencyEntry[]>("/currencies");
    return Array.isArray(res.data) ? res.data : [];
  },
};
