import BASE_URL from "./config";

// Wrapper for API calls with automatic access token refresh
export const fetchWithToken = async (url, options = {}) => {
  let token = localStorage.getItem("token");

  let fetchOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
    credentials: "include", // include cookies (refresh token)
  };

  let response = await fetch(`${BASE_URL}${url}`, fetchOptions);

  // If unauthorized → try refresh
  if (response.status === 401) {
    const refreshRes = await fetch(`${BASE_URL}/user/refresh`, {
      method: "POST",
      credentials: "include", // send refresh token cookie
    });
    const data = await refreshRes.json();

    console.log(data)
    if (data.success) {
      if (data?.accessToken) {
        console.log(data.accessToken)
        localStorage.setItem("token", data.accessToken);
        console.log("🔄 Token refreshed");

        // retry original request
        fetchOptions = {
          ...fetchOptions,
          headers: {
            ...(fetchOptions.headers || {}),
            Authorization: `Bearer ${data.accessToken}`,
          },
        };
        response = await fetch(`${BASE_URL}${url}`, fetchOptions);
      } else {
        console.error("❌ Refresh failed - No accessToken in response");
        throw new Error("Unauthorized - Please login again");
      }
    } else {
      console.error("❌ Refresh request failed", refreshRes.status);
      throw new Error("Unauthorized - Please login again");
    }
  }

  return response;
};
