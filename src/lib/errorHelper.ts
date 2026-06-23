import { NextResponse } from "next/server";

export function handleServerError(err: unknown) {
  console.error("Server Error [500]:", err);
  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 }
  );
}

export function handleClientError(err: unknown) {
  console.error("Client/Validation Error [400]:", err);
  const rawMessage = err instanceof Error ? err.message : String(err);

  // Clean up duplicate key and Mongoose errors to prevent indexing/query leak
  if (rawMessage.includes("E11000") || rawMessage.includes("duplicate key")) {
    return NextResponse.json(
      { message: "A record with this identifier already exists" },
      { status: 409 }
    );
  }

  if (
    rawMessage.includes("validation") ||
    rawMessage.includes("Cast to ObjectId") ||
    rawMessage.includes("Mongoose") ||
    rawMessage.includes("connection")
  ) {
    return NextResponse.json(
      { message: "Invalid request parameters" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: rawMessage },
    { status: 400 }
  );
}
