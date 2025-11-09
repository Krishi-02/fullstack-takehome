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
}
