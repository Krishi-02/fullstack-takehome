import type { GetUsersQuery } from "../../../__generated__/graphql";
import { GenericCell } from "./cells/GenericCell";

type Post = NonNullable<NonNullable<GetUsersQuery["users"][0]["posts"]>[0]>;

interface CardViewProps {
  data: GetUsersQuery["users"];
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
}

export const CardView = ({ data, onEditPost, onDeletePost }: CardViewProps) => {
  if (data.length === 0) {
    return <div className="p-4 text-gray-500">No users found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {data.map((user) => (
        <div
          key={user.id}
          className="bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {user.name || `User ${user.id}`}
              </h3>
              <span className="text-sm text-gray-500">ID: {user.id}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="font-medium text-gray-600 w-20">Age:</span>
                <GenericCell value={user.age} />
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-600 w-20">Email:</span>
                <GenericCell value={user.email} />
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-600 w-20">Phone:</span>
                <GenericCell value={user.phone} />
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-600">Posts:</span>
                  <span className="text-sm text-gray-500">
                    {(user.posts || []).length} post{(user.posts || []).length !== 1 ? 's' : ''}
                  </span>
                </div>
                {(user.posts || []).length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(user.posts || [])
                      .filter((post): post is Post => post !== null && post !== undefined)
                      .map((post) => (
                        <div
                          key={post.id}
                          className="bg-gray-50 p-2 rounded text-sm"
                        >
                          <div className="font-medium text-gray-800 mb-1">
                            {post.title || "Untitled"}
                          </div>
                          {post.content && (
                            <div className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {post.content}
                            </div>
                          )}
                          <div className="flex gap-2">
                            {onEditPost && (
                              <button
                                onClick={() => onEditPost(post)}
                                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white"
                              >
                                Edit
                              </button>
                            )}
                            {onDeletePost && (
                              <button
                                onClick={() => onDeletePost(post)}
                                className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded text-white"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

