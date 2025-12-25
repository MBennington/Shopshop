import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/cart/`, {
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

    // Backend now handles seller grouping, so just return the data as-is
    return NextResponse.json(data);
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

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

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Parse body correctly
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/cart/`, {
      method: "PUT",
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
      { error: "Failed to update the quantity" },
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
    const color = searchParams.get('color');
    const size = searchParams.get('size');

    if (!product_id || !color) {
      return NextResponse.json(
        { error: "product_id and color are required" },
        { status: 400 }
      );
    }

    const body: any = { product_id, color };
    if (size) body.size = size;

    const response = await fetch(`${BACKEND_URL}/api/cart/`, {
      method: "DELETE",
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
    console.error("Cart remove error:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
