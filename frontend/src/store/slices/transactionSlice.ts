import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";
import { Transaction } from "../../types";

const toArray = (data: any): Transaction[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
};

interface TxState { transactions: Transaction[]; loading: boolean; error: string | null; }
const init: TxState = { transactions: [], loading: false, error: null };

export const fetchTransactions = createAsyncThunk("tx/fetch", async (_, { rejectWithValue }) => {
  try { const r = await api.get("/transactions"); return toArray(r.data); }
  catch (e: any) { return rejectWithValue(e.response?.data?.error || "Failed"); }
});
export const createTransaction = createAsyncThunk("tx/create", async (d: any, { rejectWithValue }) => {
  try { const r = await api.post("/transactions", d); return r.data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.error || "Failed"); }
});
export const updateTransaction = createAsyncThunk("tx/update", async ({ id, req }: { id: number; req: any }, { rejectWithValue }) => {
  try { const r = await api.put(`/transactions/${id}`, req); return r.data; }
  catch (e: any) { return rejectWithValue(e.response?.data?.error || "Failed"); }
});
export const deleteTransaction = createAsyncThunk("tx/delete", async (id: number, { rejectWithValue }) => {
  try { await api.delete(`/transactions/${id}`); return id; }
  catch (e: any) { return rejectWithValue(e.response?.data?.error || "Failed"); }
});

const s = createSlice({
  name: "transactions",
  initialState: init,
  reducers: {},
  extraReducers: b => {
    b.addCase(fetchTransactions.pending, s => { s.loading = true; s.error = null; });
    b.addCase(fetchTransactions.fulfilled, (s, a) => { s.loading = false; s.transactions = a.payload; });
    b.addCase(fetchTransactions.rejected, (s, a) => { s.loading = false; s.error = a.payload as string; });
    b.addCase(createTransaction.fulfilled, (s, a) => { s.transactions = [a.payload, ...s.transactions]; });
    b.addCase(updateTransaction.fulfilled, (s, a) => { const i = s.transactions.findIndex(t => t.id === a.payload.id); if (i >= 0) s.transactions[i] = a.payload; });
    b.addCase(deleteTransaction.fulfilled, (s, a) => { s.transactions = s.transactions.filter(t => t.id !== a.payload); });
  }
});
export default s.reducer;
