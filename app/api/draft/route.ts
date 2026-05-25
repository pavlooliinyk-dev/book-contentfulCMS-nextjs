import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  // Check the secret
  if (secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  // Enable Draft Mode
  (await draftMode()).enable();

  // Accept either a full path (/books/my-book) or a bare slug (my-book).
  // Bare slugs are normalized to the book detail route.
  // Restrict to relative paths only to prevent open redirect (e.g. //evil.com).
  const redirectPath = !slug
    ? "/"
    : /^\/[^/]/.test(slug)
      ? slug
      : `/books/${slug}`;

  redirect(redirectPath);
}
