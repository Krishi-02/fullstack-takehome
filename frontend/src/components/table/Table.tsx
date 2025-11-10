import { memo, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@apollo/client/react";
import {
  GetUsersDocument,
  type GetUsersQuery,
} from "../../__generated__/graphql";
import { useState } from "react";

import { TableFilters } from "./TableFilters";
import { GenericCell } from "./cells/GenericCell";
import { LoadingSpinner } from "../LoadingSpinner";
import { PostsCell } from "./cells/PostsCell";

const columnHelper = createColumnHelper<GetUsersQuery["users"][0]>();

const TableContent = memo(({ searchValue }: { searchValue: string }) => {
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
        cell: (info) => <PostsCell posts={info.row.original.posts || []} />,
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
});

TableContent.displayName = "TableContent";

export const Table = () => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="p-2">
      <TableFilters searchValue={searchValue} setSearchValue={setSearchValue} />
      <TableContent searchValue={searchValue} />
    </div>
  );
};
