const SQUARE_BASE_URL = process.env.SQUARE_ENVIRONMENT === "production"
  ? "https://connect.squareup.com/v2"
  : "https://connect.squareupsandbox.com/v2";

export async function squareFetch(path: string, options: RequestInit = {}) {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN not configured");

  const res = await fetch(`${SQUARE_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.errors?.[0]?.detail || data.message || `Square API error: ${res.status}`);
  }
  return data;
}
