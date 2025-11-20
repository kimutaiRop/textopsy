import { NextResponse } from "next/server";
import { MESSAGE_PERSPECTIVE_DEFAULT } from "@/lib/contextOptions";

export async function GET() {
  const title = process.env.MESSAGE_PERSPECTIVE_TITLE || MESSAGE_PERSPECTIVE_DEFAULT.title;
  const description =
    process.env.MESSAGE_PERSPECTIVE_DESCRIPTION || MESSAGE_PERSPECTIVE_DEFAULT.description;

  return NextResponse.json({
    title,
    description,
  });
}

