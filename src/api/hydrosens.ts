import { HydrosensResponse, HydrosensOutputs } from "@/types/hydrosens";

export async function postHydrosens(payload: any): Promise<HydrosensOutputs> {
  const { data } = await api.post<HydrosensResponse>("/analyze", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data.results;
}