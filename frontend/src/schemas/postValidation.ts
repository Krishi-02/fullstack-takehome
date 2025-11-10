import * as Yup from "yup";

export interface CreatePostFormValues {
  userId: number;
  title: string;
  content?: string;
}

export interface UpdatePostFormValues {
  id: number;
  title?: string;
  content?: string;
}

// Validation schema for creating a post
export const createPostSchema = Yup.object().shape({
  userId: Yup.number()
    .required("User ID is required")
    .integer("User ID must be an integer")
    .positive("User ID must be positive"),
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters")
    .trim(),
  content: Yup.string()
    .optional()
    .max(10000, "Content must not exceed 10000 characters")
    .trim(),
});

// Validation schema for updating a post
export const updatePostSchema = Yup.object().shape({
  id: Yup.number()
    .required("Post ID is required")
    .integer("Post ID must be an integer")
    .positive("Post ID must be positive"),
  title: Yup.string()
    .optional()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters")
    .trim()
    .test(
      "at-least-one-field",
      "At least one field (title or content) must be provided",
      function (value) {
        const { content } = this.parent;
        return value !== undefined || content !== undefined;
      }
    ),
  content: Yup.string()
    .optional()
    .max(10000, "Content must not exceed 10000 characters")
    .trim()
    .test(
      "at-least-one-field",
      "At least one field (title or content) must be provided",
      function (value) {
        const { title } = this.parent;
        return value !== undefined || title !== undefined;
      }
    ),
});

