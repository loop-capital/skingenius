import { NextRequest, NextResponse } from "next/server";
import { createCustomer, searchCustomers, getCustomer, updateCustomer } from "@/lib/square/customers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customer = await createCustomer(body);
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    if (customerId) {
      const customer = await getCustomer(customerId);
      return NextResponse.json({ customer });
    }
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const customers = await searchCustomers({ emailAddress: email || undefined, phoneNumber: phone || undefined });
    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    if (!customerId) {
      return NextResponse.json({ error: "customerId required" }, { status: 400 });
    }
    const body = await req.json();
    const customer = await updateCustomer(customerId, body);
    return NextResponse.json({ customer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
