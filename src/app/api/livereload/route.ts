import { NextResponse } from "next/server";

// Silences requests from old service workers / browser extensions
// that poll this URL on localhost:3000 (not part of Hub).
export async function GET() {
  return new NextResponse(null, { status: 204 });
}
