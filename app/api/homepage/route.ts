import { NextResponse } from "next/server";
import { getHomePage } from "@/lib/api";

export async function GET() {
  try {
    const homePage = await getHomePage(false);
    return NextResponse.json(homePage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
