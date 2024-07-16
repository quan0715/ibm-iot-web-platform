import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.redirect(
    new URL("/dashboard/location_and_asset", req.nextUrl)
  );
}
