import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export const dashboardApi = {
  stats: async () => {
    const token =
      localStorage.getItem("land-in-token") ||
      sessionStorage.getItem("land-in-token");

    console.log("dashboardApi.stats() token =", token);

    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : {};

    const response = await axios.get(`${API_BASE}/dashboard/stats`, config);
    return response.data;
  },
};