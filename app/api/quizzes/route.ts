import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { fetchGraphQL } from "@/lib/api";
// import { BOOK_GRAPHQL_FIELDS } from "@/lib/graphql/fragments";
import { QuizCollectionData, BookRaw, Quiz } from "@/lib/types";
import { GET_QUIZ_BY_SLUG, QUIZ_FRAGMENT } from "@/lib/graphql/quiz-fragments";

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
  
  // const taxonomies = searchParams.get("taxonomies")?.split(",").filter(Boolean) || [];

  const variables: Record<string, unknown> = { limit, skip };
  // if (taxonomies.length > 0) {
  //   variables.where = { genre_contains_all: taxonomies };
  // }

  try {
    const slugParam = searchParams.get('slug');
    const questionId = searchParams.get('questionId');

    if (slugParam) {
      // Return single quiz by slug, and optionally a specific question node
      const result = await fetchGraphQL<QuizCollectionData>(
        GET_QUIZ_BY_SLUG,
        isEnabled,
        { slug: slugParam, locale: 'en-US' }
      );

      if (result.errors) {
        return NextResponse.json({ errors: result.errors }, { status: 500 });
      }

      const item = result?.data?.quizCollection?.items?.[0] || null;

      // If a specific questionId was requested, try to find it in the returned graph
      const findNodeById = (node: any, id: string | null): any | null => {
        if (!node || !id) return null;
        if (node.sys?.id === id) return node;
        const items = node.answersCollection?.items || [];
        for (const ans of items) {
          const next = ans.nextQuestion;
          if (!next) continue;
          // If embedded nextQuestion object
          if (next.sys && next.title) {
            const found = findNodeById(next, id);
            if (found) return found;
          }
        }
        return null;
      };

      if (questionId && item?.firstQuestion) {
        const found = findNodeById(item.firstQuestion, questionId);
        return NextResponse.json({ item, question: found || null });
      }

      return NextResponse.json({ item });
    }

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

    return NextResponse.json({ items: items, total });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
