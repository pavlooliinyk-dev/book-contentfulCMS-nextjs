import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { fetchGraphQL } from "@/lib/api";
// import { BOOK_GRAPHQL_FIELDS } from "@/lib/graphql/fragments";
import { QuizCollectionData, BookRaw, Quiz } from "@/lib/types";
import { GET_QUIZ_BY_SLUG, QUIZ_FRAGMENT, QUESTION_FRAGMENT, ANSWER_FRAGMENT } from "@/lib/graphql/quiz-fragments";

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

      // Helper to resolve included linked entries (Contentful style)
      const resolveLinks = (response: any) => {
        const index: Record<string, any> = {};
        (response?.includes?.Entry || []).forEach((e: any) => {
          if (e?.sys?.id) index[e.sys.id] = e;
        });

        const resolve = (node: any): any => {
          if (!node || !node.sys) return node;
          const entry = index[node.sys.id];
          if (!entry) return node;
          const resolved: Record<string, any> = { ...entry.fields, sys: entry.sys };
          for (const [k, v] of Object.entries(resolved)) {
            if (Array.isArray(v)) resolved[k] = v.map(resolve);
            else if (v && typeof v === 'object' && v.sys && v.sys.type === 'Link') resolved[k] = resolve(v);
          }
          return resolved;
        };

        const rawFirst = response?.data?.quizCollection?.items?.[0]?.firstQuestion;
        if (!rawFirst) return null;
        try {
          return resolve(rawFirst);
        } catch (e) {
          return rawFirst;
        }
      };

      if (questionId) {
        // Simplified: try Contentful Delivery/Preview REST API to fetch the entry by id
        const envName = process.env.CONTENTFUL_ENVIRONMENT || 'master';
        const spaceId = process.env.CONTENTFUL_SPACE_ID;
        const token = isEnabled ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN : process.env.CONTENTFUL_ACCESS_TOKEN;
        const apiHost = isEnabled ? 'preview.contentful.com' : 'cdn.contentful.com';

        if (spaceId && token) {
          try {
            const entryUrl = `https://${apiHost}/spaces/${spaceId}/environments/${envName}/entries/${questionId}?include=10&access_token=${token}`;
            const entryRes = await fetch(entryUrl);
            if (entryRes.ok) {
              const entryJson = await entryRes.json();

              // build index from includes
              const index: Record<string, any> = {};
              (entryJson.includes?.Entry || []).forEach((e: any) => {
                if (e?.sys?.id) index[e.sys.id] = e;
              });

              const resolveNode = (node: any): any => {
                if (!node || !node.sys) return node;
                const entry = index[node.sys.id] || node;
                const resolved: Record<string, any> = { sys: entry.sys, ...(entry.fields || {}) };
                for (const [k, v] of Object.entries(resolved)) {
                  if (Array.isArray(v)) resolved[k] = v.map((it: any) => (it && it.sys ? resolveNode(it) : it));
                  else if (v && typeof v === 'object' && v.sys) resolved[k] = resolveNode(v);
                }
                return resolved;
              };

              const resolvedQuestion = resolveNode({ sys: entryJson.sys });
              return NextResponse.json({ item, question: resolvedQuestion });
            }
          } catch (e) {
            console.error('Error fetching entry from Contentful REST API:', e);
          }
        }

        // Fallback: try resolving includes from the GraphQL result
        const resolvedFirst = resolveLinks(result);
        if (resolvedFirst) {
          const findNodeById = (node: any, id: string | null): any | null => {
            if (!node || !id) return null;
            if (node.sys?.id === id) return node;
            const items = node.answersCollection?.items || [];
            for (const ans of items) {
              const next = ans.nextQuestion;
              if (!next) continue;
              const found = findNodeById(next, id);
              if (found) return found;
            }
            return null;
          };

          const found = findNodeById(resolvedFirst, questionId);
          return NextResponse.json({ item, question: found || null });
        }
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
