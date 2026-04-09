import { api } from "./client";

export const walletApi = {
  connect: (body) => api.patch("/auth/wallet", body),
  disconnect: () => api.delete("/auth/wallet"),
};
