import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers($filters: UserFilters!) {
    users(filters: $filters) {
      id
      name
      age
      email
      phone
      posts {
        id
        title
        content
      }
    }
  }
`
