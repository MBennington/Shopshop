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

    const response = await fetch(`${BACKEND_URL}/api/wishlist/`, {
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
    console.error("Wishlist add error:", error);
    return NextResponse.json(
      { error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/wishlist/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const product_id = searchParams.get('product_id');
    const color_id = searchParams.get('color_id');

    if (!product_id || !color_id) {
      return NextResponse.json(
        { error: "product_id and color_id are required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/wishlist/?product_id=${product_id}&color_id=${color_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Wishlist remove error:", error);
    return NextResponse.json(
      { error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}

