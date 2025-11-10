import { memo, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import {
  GetUsersDocument,
  type GetUsersQuery,
} from "../../__generated__/graphql";
import { useState } from "react";

import { TableFilters } from "./TableFilters";
import { AdvancedFilters } from "./AdvancedFilters";
import { GenericCell } from "./cells/GenericCell";
import { LoadingSpinner } from "../LoadingSpinner";
import { PostsCell } from "./cells/PostsCell";
import { CreatePostModal } from "../modals/CreatePostModal";
import { EditPostModal } from "../modals/EditPostModal";
import { DeletePostDialog } from "../modals/DeletePostDialog";
import { DeletePostDocument } from "../../gql/deletePost";
import { CardView } from "./CardView";
import toast from "react-hot-toast";

const columnHelper = createColumnHelper<GetUsersQuery["users"][0]>();

type Post = NonNullable<NonNullable<GetUsersQuery["users"][0]["posts"]>[0]>;

const TableContent = memo(
  ({
    searchValue,
    onEditPost,
    onDeletePost,
    viewMode,
    selectedUserId,
    postSearch,
    dateFrom,
    dateTo,
  }: {
    searchValue: string;
    onEditPost?: (post: Post) => void;
    onDeletePost?: (post: Post) => void;
    viewMode: "table" | "card";
    selectedUserId: number | null;
    postSearch: string;
    dateFrom: string;
    dateTo: string;
  }) => {
    const filters = useMemo(() => {
      const filter: any = {};
      if (searchValue.trim()) {
        filter.name = { contains: searchValue };
      }
      if (selectedUserId !== null) {
        filter.id = { equals: selectedUserId };
      }
      return filter;
    }, [searchValue, selectedUserId]);

    const {
      data: usersData,
      loading,
      error,
    } = useQuery(GetUsersDocument, {
      variables: {
        filters,
      },
    });

    const data: GetUsersQuery["users"] = usersData?.users ?? [];

    // Apply client-side filtering for posts and dates
    const filteredData = useMemo(() => {
      let filtered = data;

      // Filter by post search (title or content)
      if (postSearch.trim()) {
        const searchLower = postSearch.toLowerCase();
        filtered = filtered.map((user) => {
          const filteredPosts = (user.posts || []).filter(
            (post) =>
              post &&
              (post.title?.toLowerCase().includes(searchLower) ||
                post.content?.toLowerCase().includes(searchLower))
          );
          return { ...user, posts: filteredPosts };
        });
      }

      // Filter by date range (on user's createdAt or post's createdAt)
      if (dateFrom || dateTo) {
        filtered = filtered.filter((user) => {
          // Check user's createdAt
          if (user.createdAt) {
            const userDate = new Date(user.createdAt);
            if (dateFrom) {
              const fromDate = new Date(dateFrom);
              if (userDate < fromDate) return false;
            }
            if (dateTo) {
              const toDate = new Date(dateTo);
              toDate.setHours(23, 59, 59, 999); // Include entire end date
              if (userDate > toDate) return false;
            }
            return true;
          }
          
          // If user doesn't have createdAt, check posts
          if (user.posts && user.posts.length > 0) {
            return user.posts.some((post) => {
              if (!post?.createdAt) return false;
              const postDate = new Date(post.createdAt);
              if (dateFrom) {
                const fromDate = new Date(dateFrom);
                if (postDate < fromDate) return false;
              }
              if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                if (postDate > toDate) return false;
              }
              return true;
            });
          }
          
          return false; // No date info available
        });
      }

      // Filter out users with no posts if post search is active
      if (postSearch.trim()) {
        filtered = filtered.filter(
          (user) => (user.posts || []).length > 0
        );
      }

      return filtered;
    }, [data, postSearch, dateFrom, dateTo]);

    const columns = useMemo(
      () => [
        columnHelper.accessor("id", {
          header: "ID",
          cell: (info) => <GenericCell value={info.getValue()} />,
        }),
        columnHelper.accessor("name", {
          header: "Name",
          cell: (info) => <GenericCell value={info.getValue()} />,
        }),
        columnHelper.accessor("age", {
          header: "Age",
          cell: (info) => <GenericCell value={info.getValue()} />,
        }),
        columnHelper.accessor("email", {
          header: "Email",
          cell: (info) => <GenericCell value={info.getValue()} />,
        }),
        columnHelper.accessor("phone", {
          header: "Phone",
          cell: (info) => <GenericCell value={info.getValue()} />,
        }),
        columnHelper.display({
          id: "posts",
          header: "Posts",
          cell: (info) => (
            <PostsCell
              posts={info.row.original.posts || []}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
            />
          ),
        }),
      ],
      []
    );

    const table = useReactTable({
      data: filteredData,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    if (loading) return <LoadingSpinner />;
    if (error)
      return <div className="p-4 text-red-500">Error: {error.message}</div>;
    if (filteredData.length === 0)
      return <div className="p-4 text-gray-500">No users found</div>;

    if (viewMode === "card") {
      return (
        <CardView
          data={filteredData}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
        />
      );
    }

    return (
      <div className="overflow-x-auto">
        <table
          className="min-w-full border-collapse border border-gray-300"
          style={{ overflow: "visible" }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border border-gray-300 px-4 py-2 bg-gray-100 text-left"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border border-gray-300 px-4 py-2 relative"
                    style={{ overflow: "visible" }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

TableContent.displayName = "TableContent";

export const Table = () => {
  const [searchValue, setSearchValue] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [postSearch, setPostSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const client = useApolloClient();

  // Get all users for the filter dropdown
  const { data: allUsersData } = useQuery(GetUsersDocument, {
    variables: { filters: {} },
  });

  const allUsers = allUsersData?.users || [];

  const handleClearFilters = () => {
    setSelectedUserId(null);
    setPostSearch("");
    setDateFrom("");
    setDateTo("");
  };

  const [deletePostMutation, { loading: deleting }] = useMutation(
    DeletePostDocument,
    {
      update: (cache, _result, { variables }) => {
        if (!variables?.id) return;

        // Optimistically remove the post from cache
        cache.updateQuery(
          { query: GetUsersDocument, variables: { filters: {} } },
          (existingData) => {
            if (!existingData) return existingData;

            return {
              ...existingData,
              users: existingData.users.map((user) => {
                if (user.posts) {
                  return {
                    ...user,
                    posts: user.posts.filter((p) => p?.id !== variables.id),
                  };
                }
                return user;
              }),
            };
          }
        );
      },
      onCompleted: () => {
        toast.success("Post deleted successfully!");
        setDeletingPost(null);
      },
      onError: (error) => {
        toast.error(`Failed to delete post: ${error.message}`);
        // Refetch on error to sync with server
        client.refetchQueries({ include: [GetUsersDocument] });
      },
    }
  );

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
  };

  const handleDeletePost = (post: Post) => {
    setDeletingPost(post);
  };

  const handleConfirmDelete = async () => {
    if (deletingPost) {
      try {
        await deletePostMutation({
          variables: { id: deletingPost.id },
        });
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  return (
    <div className="p-2">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TableFilters
            searchValue={searchValue}
            setSearchValue={setSearchValue}
          />
          <div className="flex items-center gap-2">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              title="Table view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "card"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              title="Card view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Create Post
          </button>
        </div>
        </div>
        <AdvancedFilters
          users={allUsers}
          selectedUserId={selectedUserId}
          onUserIdChange={setSelectedUserId}
          postSearch={postSearch}
          onPostSearchChange={setPostSearch}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onClear={handleClearFilters}
        />
      </div>
      <TableContent
        searchValue={searchValue}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
        viewMode={viewMode}
        selectedUserId={selectedUserId}
        postSearch={postSearch}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <EditPostModal
        isOpen={!!editingPost}
        onClose={() => setEditingPost(null)}
        post={editingPost}
      />
      <DeletePostDialog
        isOpen={!!deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleConfirmDelete}
        postTitle={deletingPost?.title || null}
        loading={deleting}
      />
    </div>
  );
};
