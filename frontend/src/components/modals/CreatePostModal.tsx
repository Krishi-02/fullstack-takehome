import { Formik, Form, Field, ErrorMessage } from "formik";
import { useMutation, useQuery, useApolloClient } from "@apollo/client/react";
import { CreatePostDocument } from "../../gql/createPost";
import { GetUsersDocument } from "../../__generated__/graphql";
import {
  createPostSchema,
  type CreatePostFormValues,
} from "../../schemas/postValidation";
import toast from "react-hot-toast";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePostModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreatePostModalProps) => {
  const { data: usersData } = useQuery(GetUsersDocument, {
    variables: { filters: {} },
  });
  const client = useApolloClient();

  const [createPostMutation, { loading: creating }] = useMutation(
    CreatePostDocument,
    {
      update: (cache, { data }) => {
        if (!data?.createPost) return;

        // Optimistically update the cache
        cache.updateQuery(
          { query: GetUsersDocument, variables: { filters: {} } },
          (existingData) => {
            if (!existingData) return existingData;

            return {
              ...existingData,
              users: existingData.users.map((user) => {
                if (user.id === data.createPost.userId) {
                  return {
                    ...user,
                    posts: [...(user.posts || []), data.createPost],
                  };
                }
                return user;
              }),
            };
          }
        );
      },
      onCompleted: () => {
        toast.success("Post created successfully!");
        onClose();
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(`Failed to create post: ${error.message}`);
        // Refetch on error to sync with server
        client.refetchQueries({ include: [GetUsersDocument] });
      },
    }
  );

  const users = usersData?.users || [];

  if (!isOpen) return null;

  const initialValues: CreatePostFormValues = {
    userId: users[0]?.id || 0,
    title: "",
    content: "",
  };

  const handleSubmit = async (
    values: CreatePostFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setSubmitting(true);
    try {
      await createPostMutation({
        variables: {
          input: {
            userId: values.userId,
            title: values.title.trim(),
            content: values.content?.trim() || undefined,
          },
        },
      });
    } catch (error) {
      // Error is handled by onError callback
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            type="button"
          >
            ×
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={createPostSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values }) => (
            <Form className="p-4 space-y-4">
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  User
                </label>
                <Field
                  as="select"
                  id="userId"
                  name="userId"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {users.length === 0 ? (
                    <option value="">Loading users...</option>
                  ) : (
                    users.map((user) => (
                      <option key={user.id} value={user.id} className="text-gray-900">
                        {user.name || `User ${user.id}`} ({user.email || "No email"})
                      </option>
                    ))
                  )}
                </Field>
                <ErrorMessage
                  name="userId"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <Field
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter post title"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Content
                </label>
                <Field
                  as="textarea"
                  id="content"
                  name="content"
                  rows={6}
                  placeholder="Enter post content (optional)"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <ErrorMessage
                  name="content"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isSubmitting || creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || creating || !values.userId}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Post"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
