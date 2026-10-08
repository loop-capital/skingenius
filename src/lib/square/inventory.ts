import { squareFetch } from "./client";

export async function getInventoryCount(catalogObjectId: string, locationId?: string) {
  const params = new URLSearchParams();
  params.set("catalog_object_id", catalogObjectId);
  if (locationId) params.set("location_id", locationId);
  return squareFetch(`/inventory?${params.toString()}`);
}

export async function adjustInventory(catalogObjectId: string, locationId: string, quantity: number, fromState: string = "IN_STOCK", toState: string = "IN_STOCK") {
  return squareFetch("/inventory/batch-change", {
    method: "POST",
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      changes: [
        {
          type: "ADJUSTMENT",
          adjustment: {
            catalogObjectId,
            locationId,
            fromState,
            toState,
            quantity: String(quantity),
            occurredAt: new Date().toISOString(),
          },
        },
      ],
    }),
  });
}

export async function getInventoryChanges(catalogObjectId: string, locationId?: string) {
  const params = new URLSearchParams();
  params.set("catalog_object_id", catalogObjectId);
  if (locationId) params.set("location_id", locationId);
  return squareFetch(`/inventory/changes?${params.toString()}`);
}
