import { FormDataLike } from "@/types/formdata";
import { api } from "./client";
import { HydrosensResponse } from "@/types/hydrosens";


export async function postHydrosens(fd: FormDataLike) {
  const { data } = await api.post<HydrosensResponse>("/analyze", fd);
  return data;
}