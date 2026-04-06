import api from "./api";
import { Category } from "../types";

const toArray = (data: any): Category[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
};

export const categoryService = {
  getAll: async (): Promise<{ data: Category[] }> => {
    const res = await api.get<any>("/categories");
    return { data: toArray(res.data) };
  },
  create: (d: any) => api.post("/categories", d),
  delete: (id: number) => api.delete(`/categories/${id}`),
};
