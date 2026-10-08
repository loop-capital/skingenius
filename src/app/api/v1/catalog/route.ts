import { NextRequest, NextResponse } from "next/server";
import { listCatalog, getCatalogItem, createCatalogItem, createCategory, deleteCatalogItem } from "@/lib/square/catalog";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    if (itemId) {
      const item = await getCatalogItem(itemId);
      return NextResponse.json({ item });
    }
    const types = searchParams.get("types")?.split(",") || undefined;
    const items = await listCatalog(types);
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.type === "category") {
      const category = await createCategory(body.name);
      return NextResponse.json({ category }, { status: 201 });
    }
    const item = await createCatalogItem(body);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }
    await deleteCatalogItem(itemId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
