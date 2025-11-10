import { useState } from "react";
import type { GetUsersQuery } from "../../../__generated__/graphql";

interface AdvancedFiltersProps {
  users: GetUsersQuery["users"];
  selectedUserId: number | null;
  onUserIdChange: (userId: number | null) => void;
  postSearch: string;
  onPostSearchChange: (search: string) => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
  onClear: () => void;
}

export const AdvancedFilters = ({
  users,
  selectedUserId,
  onUserIdChange,
  postSearch,
  onPostSearchChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClear,
}: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    selectedUserId !== null ||
    postSearch.trim() !== "" ||
    dateFrom !== "" ||
    dateTo !== "";

  return (
    <div className="mb-4 border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <svg
            className={`w-4 h-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          Advanced Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              Active
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by User
            </label>
            <select
              value={selectedUserId || ""}
              onChange={(e) =>
                onUserIdChange(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || `User ${user.id}`} ({user.email || "No email"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Posts
            </label>
            <input
              type="text"
              placeholder="Search in post titles/content..."
              value={postSearch}
              onChange={(e) => onPostSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

