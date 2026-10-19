"use server";
import axios from "axios";
import { cookies } from "next/headers";
export const uploadDocument = async (data: unknown) => {
  const cookie = await cookies();

  const accessToken = cookie.get("access_token");

  if (!accessToken?.value) throw Error("Unauthorized access");

  await axios.post("http://localhost:9090/api/v1/documents", data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken.value}`,
    },
  });
};

export interface Document {
  id: number;
  user_id: number;
  url: string;
}

export const getAllDocuments = async () => {
  const cookie = await cookies();

  const accessToken = cookie.get("access_token");

  if (!accessToken?.value) throw Error("Unauthorized access");

  const result = await axios.get<Document[]>(
    "http://localhost:9090/api/v1/documents",
    {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    },
  );
  return result.data;
};
