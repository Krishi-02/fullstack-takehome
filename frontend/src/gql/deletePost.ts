import { graphql } from "../__generated__/gql";

export const DeletePostDocument = graphql(`
  mutation DeletePost($id: Int!) {
    deletePost(id: $id)
  }
`);

