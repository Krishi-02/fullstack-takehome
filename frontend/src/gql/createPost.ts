import { graphql } from "../__generated__/gql";

export const CreatePostDocument = graphql(`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      userId
      createdAt
      updatedAt
    }
  }
`);

