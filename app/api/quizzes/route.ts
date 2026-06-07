import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { fetchGraphQL } from "@/lib/api";
import { BOOK_GRAPHQL_FIELDS } from "@/lib/graphql/fragments";
import { QuizCollectionData, BookRaw, Quiz } from "@/lib/types";
import { QUIZ_FRAGMENT } from "@/lib/graphql/quiz-fragments";

export async function GET(request: NextRequest) {
  const { isEnabled } = await draftMode();
  const { searchParams } = new URL(request.url);
  
  const MAX_LIMIT = 10;
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") || "5")),
    MAX_LIMIT
  );
  const skip = Math.max(0, parseInt(searchParams.get("skip") || "0"));
  
  // Validate parsed numbers
  if (isNaN(limit) || isNaN(skip)) {
    return NextResponse.json(
      { error: "Invalid limit or skip parameter" },
      { status: 400 }
    );
  }
  
  const taxonomies = searchParams.get("taxonomies")?.split(",").filter(Boolean) || [];

  const variables: Record<string, unknown> = { limit, skip };
  if (taxonomies.length > 0) {
    variables.where = { genre_contains_all: taxonomies };
  }

  try {
    const result = await fetchGraphQL<QuizCollectionData>(
      `query GetQuizzes($limit: Int!, $skip: Int!, $where: BookFilter) {
        quizCollection(limit: $limit, skip: $skip, order: title_DESC, preview: ${isEnabled ? "true" : "false"}, where: $where) {
          total
          items {
            ${QUIZ_FRAGMENT}
          }
        }
      }`,
      isEnabled,
      variables
    );

    if (result.errors) {
      return NextResponse.json({ errors: result.errors }, { status: 500 });
    }

    const items = result?.data?.quizCollection?.items || [];
    const total = result?.data?.quizCollection?.total || 0;
    
    // Transform to Quiz type with authors and taxonomies arrays
    // const formattedItems: Quiz[] = items.map((item) => ({
    //   ...item,
    //   questions: item.questions?.map((item) => item.question) || [],
    // }));

    return NextResponse.json({ items: items, total });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
