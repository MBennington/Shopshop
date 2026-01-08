import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Parse body correctly
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/wishlist/add-to-cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    // console.error("Wishlist add to cart error:", error);
    return NextResponse.json(
      { error: "Failed to add wishlist item to cart" },
      { status: 500 }
    );
  }
}

