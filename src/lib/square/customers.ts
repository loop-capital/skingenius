import { squareFetch } from "./client";

export async function createCustomer(customer: {
  givenName: string;
  familyName: string;
  emailAddress?: string;
  phoneNumber?: string;
}) {
  return squareFetch("/customers", {
    method: "POST",
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      ...customer,
    }),
  });
}

export async function searchCustomers(query?: { emailAddress?: string; phoneNumber?: string }) {
  const filter: any = {};
  if (query?.emailAddress) filter.emailAddress = { fuzzy: query.emailAddress };
  if (query?.phoneNumber) filter.phoneNumber = { fuzzy: query.phoneNumber };

  return squareFetch("/customers/search", {
    method: "POST",
    body: JSON.stringify({
      query: Object.keys(filter).length > 0 ? { filter } : undefined,
    }),
  });
}

export async function getCustomer(customerId: string) {
  return squareFetch(`/customers/${customerId}`);
}

export async function updateCustomer(customerId: string, updates: Partial<{
  givenName: string;
  familyName: string;
  emailAddress: string;
  phoneNumber: string;
}>) {
  return squareFetch(`/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}
