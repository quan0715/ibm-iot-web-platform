import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.redirect(
    new URL(
      "/dashboard/management/location_and_asset?page=Location",
      req.nextUrl
    )
  );
}
