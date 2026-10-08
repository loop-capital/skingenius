import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrder, searchOrders } from "@/lib/square/orders";

const LOCATION_ID = process.env.SQUARE_LOCATION_ID || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await createOrder(LOCATION_ID, body.items);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    if (orderId) {
      const order = await getOrder(orderId);
      return NextResponse.json({ order });
    }
    const orders = await searchOrders(LOCATION_ID);
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
