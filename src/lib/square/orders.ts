import { squareFetch } from "./client";

export async function createOrder(locationId: string, items: Array<{ catalogObjectId: string; quantity: string }>) {
  return squareFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      locationId,
      order: {
        locationId,
        lineItems: items.map((item) => ({
          catalogObjectId: item.catalogObjectId,
          quantity: item.quantity,
        })),
      },
    }),
  });
}

export async function getOrder(orderId: string) {
  return squareFetch(`/orders/${orderId}`);
}

export async function searchOrders(locationId: string, query?: { dateTimeFilter?: { startAt?: string; endAt?: string } }) {
  return squareFetch("/orders/search", {
    method: "POST",
    body: JSON.stringify({
      locationIds: [locationId],
      ...(query?.dateTimeFilter ? { dateTimeFilter: query.dateTimeFilter } : {}),
    }),
  });
}

export async function updateOrder(locationId: string, orderId: string, items: Array<{ catalogObjectId: string; quantity: string }>, version?: bigint) {
  return squareFetch("/orders", {
    method: "PUT",
    body: JSON.stringify({
      order: {
        locationId,
        lineItems: items.map((item) => ({
          catalogObjectId: item.catalogObjectId,
          quantity: item.quantity,
        })),
        version,
      },
    }),
  });
}
