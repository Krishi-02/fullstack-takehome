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
import { GenericCell } from "./cells/GenericCell";
import { LoadingSpinner } from "../LoadingSpinner";
import { PostsCell } from "./cells/PostsCell";
import { CreatePostModal } from "../modals/CreatePostModal";
import { EditPostModal } from "../modals/EditPostModal";
import { DeletePostDialog } from "../modals/DeletePostDialog";
import { DeletePostDocument } from "../../gql/deletePost";
import toast from "react-hot-toast";

const columnHelper = createColumnHelper<GetUsersQuery["users"][0]>();

type Post = NonNullable<NonNullable<GetUsersQuery["users"][0]["posts"]>[0]>;

const TableContent = memo(
  ({
    searchValue,
    onEditPost,
    onDeletePost,
  }: {
    searchValue: string;
    onEditPost?: (post: Post) => void;
    onDeletePost?: (post: Post) => void;
  }) => {
    const filters = useMemo(() => {
      const filter: any = {};
      if (searchValue.trim()) {
        filter.name = { contains: searchValue };
      }
      return filter;
    }, [searchValue]);

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
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    if (loading) return <LoadingSpinner />;
    if (error)
      return <div className="p-4 text-red-500">Error: {error.message}</div>;
    if (data.length === 0)
      return <div className="p-4 text-gray-500">No users found</div>;

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPost, setDeletingPost] = useState<Post | null>(null);
  const client = useApolloClient();

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
      <div className="flex justify-between items-center mb-4">
        <TableFilters
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + Create Post
        </button>
      </div>
      <TableContent
        searchValue={searchValue}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
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
