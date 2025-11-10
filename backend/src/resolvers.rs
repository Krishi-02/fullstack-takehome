use async_graphql::{Context, InputObject, Object, Result};
use backend::FilterBuilder;
use sqlx::{
    FromRow, PgPool,
    types::chrono::{DateTime, Utc},
};

#[derive(FromRow)]
struct User {
    id: i32,
    name: Option<String>,
    age: Option<i32>,
    email: Option<String>,
    phone: Option<String>,
    created_at: Option<DateTime<Utc>>,
    updated_at: Option<DateTime<Utc>>,
}


#[derive(InputObject)]
struct IntFilter {
    equals: Option<i32>,
    gt: Option<i32>,
    lt: Option<i32>,
    gte: Option<i32>,
    lte: Option<i32>,
}

#[derive(InputObject)]
struct StringFilter {
    equals: Option<String>,
    contains: Option<String>,
    starts_with: Option<String>,
    ends_with: Option<String>,
}

#[derive(InputObject, FilterBuilder)]
struct UserFilters {
    id: Option<IntFilter>,
    name: Option<StringFilter>,
    age: Option<IntFilter>,
    email: Option<StringFilter>,
    phone: Option<StringFilter>,
}

#[derive(InputObject, FilterBuilder)]
struct PostFilters {
    id: Option<IntFilter>,
    user_id: Option<IntFilter>,
    title: Option<StringFilter>,
    content: Option<StringFilter>,
}

#[derive(FromRow)]
struct Post {
    id: i32,
    user_id: Option<i32>,
    title: Option<String>,
    content: Option<String>,
    created_at: Option<DateTime<Utc>>,
    updated_at: Option<DateTime<Utc>>,
}

// This is your resolver for the User model
#[Object]
impl User {
    async fn id(&self) -> i32 {
        self.id
    }

    async fn name(&self) -> &Option<String> {
        &self.name
    }

    async fn age(&self) -> &Option<i32> {
        &self.age
    }

    async fn email(&self) -> &Option<String> {
        &self.email
    }

    async fn phone(&self) -> &Option<String> {
        &self.phone
    }

    async fn created_at(&self) -> &Option<DateTime<Utc>> {
        &self.created_at
    }

    async fn updated_at(&self) -> &Option<DateTime<Utc>> {
        &self.updated_at
    }

    async fn posts(&self, ctx: &Context<'_>) -> Result<Vec<Post>> {
        let pool = ctx.data::<PgPool>()?;
        let posts = sqlx::query_as::<_, Post>("SELECT * FROM posts WHERE user_id = $1")
            .bind(self.id)
            .fetch_all(pool)
            .await?;
        Ok(posts)
    }
}
// This is your resolver for the Post model
#[Object]
impl Post {
    async fn id(&self) -> i32 {
        self.id
    }

    async fn user_id(&self) -> &Option<i32> {
        &self.user_id
    }

    async fn title(&self) -> &Option<String> {
        &self.title
    }

    async fn content(&self) -> &Option<String> {
        &self.content
    }

    async fn created_at(&self) -> &Option<DateTime<Utc>> {
        &self.created_at
    }

    async fn updated_at(&self) -> &Option<DateTime<Utc>> {
        &self.updated_at
    }

    async fn user(&self, ctx: &Context<'_>) -> Result<Option<User>> {
        if let Some(user_id) = self.user_id {
            let pool = ctx.data::<PgPool>()?;
            let user = sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = $1")
                .bind(user_id)
                .fetch_optional(pool)
                .await?;
            Ok(user)
        } else {
            Ok(None)
        }
    }
}

#[derive(InputObject)]
struct CreatePostInput {
    user_id: i32,
    title: String,
    content: Option<String>,
}

#[derive(InputObject)]
struct UpdatePostInput {
    id: i32,
    title: Option<String>,
    content: Option<String>,
}

#[derive(Default)]
pub struct Query;

#[Object]
impl Query {
    async fn users(&self, ctx: &Context<'_>, filters: UserFilters) -> Result<Vec<User>> {
        let _pool = ctx.data::<PgPool>()?;
        let where_clause = filters.build_where_clause();
        let query = format!("SELECT * FROM users{}", where_clause);
        let users = sqlx::query_as::<_, User>(&query).fetch_all(_pool).await?;
        Ok(users)
    }

    async fn posts(&self, ctx: &Context<'_>, filters: PostFilters) -> Result<Vec<Post>> {
        let _pool = ctx.data::<PgPool>()?;
        let where_clause = filters.build_where_clause();
        let query = format!("SELECT * FROM posts{}", where_clause);
        let posts = sqlx::query_as::<_, Post>(&query).fetch_all(_pool).await?;
        Ok(posts)
    }

    async fn post(&self, ctx: &Context<'_>, id: i32) -> Result<Option<Post>> {
        let pool = ctx.data::<PgPool>()?;
        let post = sqlx::query_as::<_, Post>("SELECT * FROM posts WHERE id = $1")
            .bind(id)
            .fetch_optional(pool)
            .await?;
        Ok(post)
    }
}

#[derive(Default)]
pub struct Mutation;

#[Object]
impl Mutation {
    async fn create_post(&self, ctx: &Context<'_>, input: CreatePostInput) -> Result<Post> {
        let pool = ctx.data::<PgPool>()?;
        
        // Verify user exists
        let user_exists = sqlx::query_scalar::<_, bool>(
            "SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)"
        )
        .bind(input.user_id)
        .fetch_one(pool)
        .await?;
        
        if !user_exists {
            return Err(async_graphql::Error::new("User not found"));
        }
        
        let post = sqlx::query_as::<_, Post>(
            "INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *"
        )
        .bind(input.user_id)
        .bind(&input.title)
        .bind(&input.content)
        .fetch_one(pool)
        .await?;
        
        Ok(post)
    }

    async fn update_post(&self, ctx: &Context<'_>, input: UpdatePostInput) -> Result<Post> {
        let pool = ctx.data::<PgPool>()?;
        
        // Check if post exists
        let post_exists = sqlx::query_scalar::<_, bool>(
            "SELECT EXISTS(SELECT 1 FROM posts WHERE id = $1)"
        )
        .bind(input.id)
        .fetch_one(pool)
        .await?;
        
        if !post_exists {
            return Err(async_graphql::Error::new("Post not found"));
        }
        
        // Build update query with parameterized queries for safety
        match (input.title.as_ref(), input.content.as_ref()) {
            (Some(title), Some(content)) => {
                let post = sqlx::query_as::<_, Post>(
                    "UPDATE posts SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *"
                )
                .bind(title)
                .bind(content)
                .bind(input.id)
                .fetch_one(pool)
                .await?;
                Ok(post)
            }
            (Some(title), None) => {
                let post = sqlx::query_as::<_, Post>(
                    "UPDATE posts SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *"
                )
                .bind(title)
                .bind(input.id)
                .fetch_one(pool)
                .await?;
                Ok(post)
            }
            (None, Some(content)) => {
                let post = sqlx::query_as::<_, Post>(
                    "UPDATE posts SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *"
                )
                .bind(content)
                .bind(input.id)
                .fetch_one(pool)
                .await?;
                Ok(post)
            }
            (None, None) => {
                // If no fields to update, just return the existing post
                let post = sqlx::query_as::<_, Post>("SELECT * FROM posts WHERE id = $1")
                    .bind(input.id)
                    .fetch_one(pool)
                    .await?;
                Ok(post)
            }
        }
    }

    async fn delete_post(&self, ctx: &Context<'_>, id: i32) -> Result<bool> {
        let pool = ctx.data::<PgPool>()?;
        
        let rows_affected = sqlx::query("DELETE FROM posts WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?
            .rows_affected();
        
        Ok(rows_affected > 0)
    }
}
