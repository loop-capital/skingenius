import { squareFetch } from "./client";

export async function listCatalog(types?: string[]) {
  const params = new URLSearchParams();
  if (types?.length) params.set("types", types.join(","));
  return squareFetch(`/catalog/list?${params.toString()}`);
}

export async function getCatalogItem(itemId: string) {
  return squareFetch(`/catalog/object/${itemId}`);
}

export async function createCatalogItem(item: {
  name: string;
  description?: string;
  categoryId?: string;
  variations: Array<{ name: string; price: number; sku?: string }>;
}) {
  return squareFetch("/catalog/object", {
    method: "POST",
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      object: {
        type: "ITEM",
        id: "#" + crypto.randomUUID(),
        itemData: {
          name: item.name,
          description: item.description,
          categoryId: item.categoryId,
          variations: item.variations.map((v) => ({
            type: "ITEM_VARIATION",
            id: "#" + crypto.randomUUID(),
            itemVariationData: {
              name: v.name,
              pricingType: "FIXED_PRICE",
              priceMoney: {
                amount: Math.round(v.price * 100),
                currency: "USD",
              },
              sku: v.sku,
            },
          })),
        },
      },
    }),
  });
}

export async function createCategory(name: string) {
  return squareFetch("/catalog/object", {
    method: "POST",
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      object: {
        type: "CATEGORY",
        id: "#" + crypto.randomUUID(),
        categoryData: { name },
      },
    }),
  });
}

export async function deleteCatalogItem(itemId: string) {
  return squareFetch("/catalog/batch-delete", {
    method: "POST",
    body: JSON.stringify({ objectIds: [itemId] }),
  });
}
