"use server";
import { cookies } from "next/headers";
import axios from "axios";
import { redirect } from "next/navigation";

export interface LoginPayload {
  identity: string;
  password: string;
}

export const login = async (payload: LoginPayload) => {
  const response = await axios.post<{ access_token: string }>(
    "http://localhost:9090/api/v1/auth/sign-in",
    payload,
  );

  (await cookies()).set("access_token", response.data.access_token);
  redirect("/dashboard")
};
