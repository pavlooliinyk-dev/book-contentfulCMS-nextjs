/**
 * GraphQL Fragments for Quiz queries
 */

export const ANSWER_FRAGMENT = `
  fragment AnswerFields on QuizAnswer {
    sys {
      id
    }
    text
    nextQuestion {
      sys {
        id
      }
    }
  }
`;

export const QUESTION_FRAGMENT = `
  fragment QuestionFields on QuizQuestion {
    sys {
      id
    }
    title
    text
    answerType
    answersCollection {
      items {
        ... on QuizAnswer {
          ...AnswerFields
        }
      }
    }
  }
`;

export const QUIZ_FRAGMENT = `
  fragment QuizFields on Quiz {
    sys {
      id
    }
    title
    slug
    description {
      json
    }
    questions
    passingScore
    published
    firstQuestion {
      ... on QuizQuestion {
        ...QuestionFields
      }
    }
  }
`;

export const GET_QUIZ_BY_SLUG = `
  query GetQuizBySlug($slug: String!) {
    quizCollection(limit: 1, where: { slug: $slug, published: true }) {
      items {
        ...QuizFields
      }
    }
  }
  ${QUIZ_FRAGMENT}
  ${QUESTION_FRAGMENT}
  ${ANSWER_FRAGMENT}
`;

export const GET_ALL_QUIZZES = `
  query GetAllQuizzes($limit: Int = 10, $skip: Int = 0) {
    quizCollection(limit: $limit, skip: $skip, where: { published: true }) {
      total
      items {
        ...QuizFields
      }
    }
  }
  ${QUIZ_FRAGMENT}
`;

export const GET_FEATURED_QUIZZES = `
  query GetFeaturedQuizzes($limit: Int = 6) {
    quizCollection(limit: $limit, where: { published: true }, order: sys_firstPublishedAt_DESC) {
      items {
        ...QuizFields
      }
    }
  }
  ${QUIZ_FRAGMENT}
`;
