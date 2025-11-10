import type { ReactNode } from "react";

interface GenericCellProps {
  value: unknown;
}

export const GenericCell = ({ value }: GenericCellProps): ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>;
  }

  if (typeof value === "string") {
    return <span>{value}</span>;
  }

  if (typeof value === "number") {
    return <span>{value.toLocaleString()}</span>;
  }

  if (typeof value === "boolean") {
    return <span>{value ? "Yes" : "No"}</span>;
  }

  if (value instanceof Date) {
    return <span>{value.toLocaleDateString()}</span>;
  }

  if (Array.isArray(value)) {
    return <span>{value.length} items</span>;
  }

  if (typeof value === "object") {
    return <span>{JSON.stringify(value)}</span>;
  }

  return <span>{String(value)}</span>;
};
