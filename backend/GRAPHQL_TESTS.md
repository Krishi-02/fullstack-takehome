# GraphQL CRUD Operations Test Guide

## Access GraphiQL

Open: http://localhost:8000/graphiql or http://localhost:8000/

## Test Queries

### 1. Get All Posts (with filters)

```graphql
query GetAllPosts {
  posts(filters: {}) {
    id
    title
    content
    userId
    createdAt
    updatedAt
  }
}
```

### 2. Get All Posts with Filters

```graphql
query GetFilteredPosts {
  posts(filters: { title: { contains: "Rust" } }) {
    id
    title
    content
    userId
  }
}
```

### 3. Get Post By ID

```graphql
query GetPostById {
  post(id: 1) {
    id
    title
    content
    userId
    createdAt
    updatedAt
    user {
      id
      name
      email
    }
  }
}
```

## Test Mutations

### 4. Create Post

```graphql
mutation CreatePost {
  createPost(
    input: {
      userId: 1
      title: "New Post Title"
      content: "This is the content of the new post"
    }
  ) {
    id
    title
    content
    userId
    createdAt
    updatedAt
  }
}
```

**Note:** The field name in GraphQL is `userId` (camelCase), which maps to `user_id` (snake_case) in the backend.

### 5. Update Post (update both title and content)

```graphql
mutation UpdatePost {
  updatePost(
    input: { id: 1, title: "Updated Title", content: "Updated content here" }
  ) {
    id
    title
    content
    updatedAt
  }
}
```

### 6. Update Post (update only title)

```graphql
mutation UpdatePostTitle {
  updatePost(input: { id: 1, title: "Only Title Updated" }) {
    id
    title
    content
    updatedAt
  }
}
```

### 7. Update Post (update only content)

```graphql
mutation UpdatePostContent {
  updatePost(input: { id: 1, content: "Only content updated" }) {
    id
    title
    content
    updatedAt
  }
}
```

### 8. Delete Post

```graphql
mutation DeletePost {
  deletePost(id: 1)
}
```

## Test Scenarios

### Scenario 1: Full CRUD Flow

1. Create a new post
2. Get the post by ID to verify creation
3. Update the post
4. Get the post again to verify update
5. Delete the post
6. Try to get the deleted post (should return null)

### Scenario 2: Error Handling

1. Try to create post with non-existent user_id (should error)
2. Try to update non-existent post (should error)
3. Try to delete non-existent post (should return false)

### Scenario 3: Filtering

1. Filter posts by title containing "Rust"
2. Filter posts by content containing "GraphQL"
3. Filter posts by user_id
4. Combine multiple filters
