import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Parse body correctly
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/cart/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // add this
        Authorization: token,
      },
      body: JSON.stringify(body), // forward request body
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json(
      { error: "Failed to add to the cart" },
      { status: 500 }
    );
  }
}
