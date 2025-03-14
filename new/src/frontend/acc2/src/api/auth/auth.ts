import { api } from "../base";

export const login = async () => {
  const response = await api.get("/auth/login");

  if (!response.data.success) {
    throw Error(response.data.message);
  }
};
