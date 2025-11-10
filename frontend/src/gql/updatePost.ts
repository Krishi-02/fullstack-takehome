import { graphql } from "../__generated__/gql";

export const UpdatePostDocument = graphql(`
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      id
      title
      content
      userId
      createdAt
      updatedAt
    }
  }
`);

