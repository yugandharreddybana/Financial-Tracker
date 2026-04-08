import api from "./api";
export const aiService = {
  getInsights: (d:any) => api.post("/ai/insights", d),
  getSavingsTips: (d:any) => api.post("/ai/savings-tips", d),
  getBudgetAdvice: (d:any) => api.post("/ai/budget-advice", d),
  getCarbonInsights: (d:any) => api.post("/ai/carbon-insights", d),
  getMonthlyReview: (d:any) => api.post("/ai/monthly-review", d),
  getSubscriptionAdvice: (d:any) => api.post("/subscriptions/advice", d),
  chat: (message:string, history:{role:string;content:string}[]=[]) => api.post("/ai/chat", { message, history }),
  scanReceipt: (file:File) => { const f = new FormData(); f.append("receipt", file); return api.post("/receipt/scan", f); },
  getExchangeRates: (base="EUR") => api.get(`/exchange-rates?base=${base}`),
};
