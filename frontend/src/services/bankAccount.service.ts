import api from "./api";
import { BankAccount } from "../types";

export const bankAccountService = {
  getAll: () => api.get<BankAccount[]>("/bank-accounts"),
  create: (payload: { name: string; icon: string; color: string; currencyCode: string; currentBalance?: number }) =>
    api.post("/bank-accounts", payload),
  delete: (id: number) => api.delete(`/bank-accounts/${id}`),
};
