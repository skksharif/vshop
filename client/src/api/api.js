import BASE_URL from "./config";

// Wrapper for API calls with automatic access token refresh
export const fetchWithToken = async (url, options = {}) => {
  let token = localStorage.getItem("token");

  const fetchOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
    credentials: "include", // send cookies for refresh token
  };

  let response = await fetch(`${BASE_URL}${url}`, fetchOptions);

  // If access token expired, try to refresh
  if (response.status === 401) {
    const refreshRes = await fetch(`${BASE_URL}/user/refresh`, {
      method: "POST",
      credentials: "include", // send HTTP-only refresh token
    });
    
     const data = await refreshRes.json();
    if (data.success) {
      
      localStorage.setItem("token", data.accessToken);
      console.log("refresh success")

      // Retry original request with new token
      fetchOptions.headers.Authorization = `Bearer ${data.accessToken}`;
      response = await fetch(`${BASE_URL}${url}`, fetchOptions);
    }
  }

  return response;
};
