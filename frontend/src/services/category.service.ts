import api from "./api";
export const categoryService = { getAll: () => api.get("/categories"), create: (d:any) => api.post("/categories", d), delete: (id:number) => api.delete(`/categories/${id}`) };
