// API utility for handling both local and production environments
const getApiUrl = (endpoint: string): string => {
  // In production, use the backend URL from environment variable
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      console.error("NEXT_PUBLIC_API_URL is not set in production");
      return endpoint; // Fallback to relative path
    }
    return `${backendUrl}${endpoint}`;
  }

  // In development, use relative paths
  return endpoint;
};

export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = getApiUrl(endpoint);

  // Add default headers
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers: defaultHeaders,
  });
};

// Helper functions for common HTTP methods
export const apiGet = (endpoint: string, options?: RequestInit) =>
  apiCall(endpoint, { ...options, method: "GET" });

export const apiPost = (
  endpoint: string,
  data?: unknown,
  options?: RequestInit
) =>
  apiCall(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });

export const apiPut = (
  endpoint: string,
  data?: unknown,
  options?: RequestInit
) =>
  apiCall(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });

export const apiDelete = (endpoint: string, options?: RequestInit) =>
  apiCall(endpoint, { ...options, method: "DELETE" });

// For file uploads
export const apiUpload = async (
  endpoint: string,
  formData: FormData,
  options?: RequestInit
) => {
  const url = getApiUrl(endpoint);

  return fetch(url, {
    ...options,
    method: "POST",
    body: formData,
    // Don't set Content-Type for FormData, let browser set it with boundary
  });
};
