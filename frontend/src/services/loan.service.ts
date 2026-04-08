import api from "./api";
export const loanService = {
  getAll: () => api.get("/loans"),
  create: (data: any) => api.post("/loans", data),
  update: (id: number, data: any) => api.put(`/loans/${id}`, data),
  makePayment: (id: number, amount: number) => api.post(`/loans/${id}/payment`, { amount }),
  getAmortization: (id: number) => api.get(`/loans/${id}/amortization`),
  delete: (id: number) => api.delete(`/loans/${id}`),
};
