import { NextRequest, NextResponse } from "next/server";
import { getInventoryCount, adjustInventory } from "@/lib/square/inventory";

const LOCATION_ID = process.env.SQUARE_LOCATION_ID || "";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const catalogObjectId = searchParams.get("catalogObjectId");
    if (!catalogObjectId) {
      return NextResponse.json({ error: "catalogObjectId required" }, { status: 400 });
    }
    const counts = await getInventoryCount(catalogObjectId, LOCATION_ID);
    return NextResponse.json({ counts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await adjustInventory(body.catalogObjectId, LOCATION_ID, body.quantity, body.fromState, body.toState);
    return NextResponse.json({ result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
