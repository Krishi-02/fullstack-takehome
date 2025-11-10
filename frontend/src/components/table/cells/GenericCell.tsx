import type { ReactNode } from "react";

interface GenericCellProps {
  value: unknown;
}

export const GenericCell = ({ value }: GenericCellProps): ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">—</span>;
  }

  if (typeof value === "string") {
    return <span className="text-gray-900">{value}</span>;
  }

  if (typeof value === "number") {
    return <span className="text-gray-900">{value.toLocaleString()}</span>;
  }

  if (typeof value === "boolean") {
    return <span className="text-gray-900">{value ? "Yes" : "No"}</span>;
  }

  if (value instanceof Date) {
    return <span className="text-gray-900">{value.toLocaleDateString()}</span>;
  }

  if (Array.isArray(value)) {
    return <span className="text-gray-900">{value.length} items</span>;
  }

  if (typeof value === "object") {
    return <span className="text-gray-900">{JSON.stringify(value)}</span>;
  }

  return <span className="text-gray-900">{String(value)}</span>;
};
