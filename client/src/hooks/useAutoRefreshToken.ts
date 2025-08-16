// hooks/useAutoRefreshToken.ts
import { useEffect } from 'react';
import * as jwt_decode from "jwt-decode";
import { refreshAccessToken } from '../services/auth';
import { useAuthStore } from '../store/auth';

export const useAutoRefreshToken = () => {
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleRefresh = (token: string) => {
      const decoded: any = jwt_decode(token);
      const expiresAt = decoded.exp * 1000; // JWT exp is in seconds
      const now = Date.now();
      const timeLeft = expiresAt - now;

      // Refresh 1 minute before expiration
      const refreshTime = Math.max(timeLeft - 60_000, 0);

      timeoutId = setTimeout(async () => {
        const newToken = await refreshAccessToken();
        if (newToken) {
          setToken(newToken);
          scheduleRefresh(newToken); // schedule next refresh
        } else {
          // refresh failed, logout user
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }, refreshTime);
    };

    const token = useAuthStore.getState().accessToken;
    if (token) scheduleRefresh(token);

    return () => clearTimeout(timeoutId);
  }, [setToken]);
};
