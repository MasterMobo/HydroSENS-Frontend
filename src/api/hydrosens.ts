import { api } from "./client";
import { HydrosensResponse } from "@/types/hydrosens";


export async function postHydrosens(payload: any) {
  const { data } = await api.post<HydrosensResponse>("/analyze", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}