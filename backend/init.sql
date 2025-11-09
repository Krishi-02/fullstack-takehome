-- Initialize the database with a users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, age, email, phone) VALUES
    (1, 'John Doe', 25, 'john.doe@example.com', '123-456-7890'),
    (2, 'Jane Smith', 30, 'jane.smith@example.com', '098-765-4321'),
    (4, 'Bob Johnson', 35, 'bob.johnson@example.com', '555-123-4567')
ON CONFLICT (email) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'user_id') THEN
        ALTER TABLE posts ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'content') THEN
        ALTER TABLE posts ADD COLUMN content TEXT;
    END IF;
END $$;

INSERT INTO posts (id, user_id, title, content, created_at, updated_at) VALUES
    -- Posts by John Doe (user_id: 1)
    (1, 1, 'Getting Started with Rust', 'Rust is a systems programming language that runs blazingly fast, prevents segfaults, and guarantees thread safety. In this post, we''ll explore the basics of Rust syntax, ownership, and memory management.', '2025-01-01 10:00:00', '2025-01-01 10:00:00'),
    (2, 1, 'Understanding Ownership', 'Ownership is Rust''s most unique feature and enables Rust to make memory safety guarantees without needing a garbage collector. Let''s dive deep into how ownership, borrowing, and lifetimes work together.', '2025-01-02 14:30:00', '2025-01-02 14:30:00'),
    (3, 1, 'Building Web APIs', 'Learn how to build high-performance web APIs using Rust with frameworks like Axum and async-graphql. We''ll cover routing, middleware, error handling, and database integration.', '2025-01-03 09:15:00', '2025-01-03 09:15:00'),
    
    -- Posts by Jane Smith (user_id: 2)
    (4, 2, 'GraphQL vs REST', 'GraphQL provides a more efficient, powerful and flexible alternative to REST. We''ll compare the two approaches, discuss when to use each, and explore real-world implementation patterns.', '2025-01-01 16:20:00', '2025-01-01 16:20:00'),
    (5, 2, 'Database Design Patterns', 'Good database design is crucial for application performance and maintainability. This post covers normalization, indexing strategies, and common design patterns for relational databases.', '2025-01-02 11:45:00', '2025-01-02 11:45:00'),
    (6, 2, 'Frontend State Management', 'Managing state in modern React applications can be challenging. We''ll explore different state management solutions including Context API, Redux, Zustand, and when to use each approach.', '2025-01-04 13:10:00', '2025-01-04 13:10:00'),
    
    -- Posts by Bob Johnson (user_id: 4)
    (7, 4, 'Docker Containerization', 'Docker has revolutionized how we package and deploy applications. Learn the fundamentals of containers, images, Dockerfiles, and best practices for containerizing your applications.', '2025-01-01 08:30:00', '2025-01-01 08:30:00'),
    (8, 4, 'Kubernetes Deployment', 'Kubernetes is the industry standard for container orchestration. This guide covers pods, services, deployments, and how to deploy and scale applications in a Kubernetes cluster.', '2025-01-03 15:45:00', '2025-01-03 15:45:00'),
    (9, 4, 'CI/CD Best Practices', 'Continuous Integration and Continuous Deployment are essential for modern software development. We''ll discuss pipeline design, testing strategies, and automation best practices.', '2025-01-05 10:20:00', '2025-01-05 10:20:00'),
    (10, 4, 'Monitoring and Observability', 'Understanding what''s happening in production is critical. Learn about metrics, logging, tracing, and how to build a comprehensive observability strategy for your applications.', '2025-01-06 12:00:00', '2025-01-06 12:00:00')
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;