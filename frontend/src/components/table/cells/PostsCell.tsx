import { useState, useRef, useEffect } from "react";
import type { GetUsersQuery } from "../../../__generated__/graphql";

type Post = NonNullable<NonNullable<GetUsersQuery["users"][0]["posts"]>[0]>;

interface PostsCellProps {
  posts: (Post | null | undefined)[];
  onEditPost?: (post: Post) => void;
  onDeletePost?: (post: Post) => void;
}

export const PostsCell = ({ posts, onEditPost, onDeletePost }: PostsCellProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const cellRef = useRef<HTMLTableCellElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (isHovered && cellRef.current && tooltipRef.current) {
      const cellRect = cellRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = cellRect.left + cellRect.width / 2 - tooltipRect.width / 2;
      let top = cellRect.bottom + 8;

      // Adjust if tooltip would go off the right edge
      if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
      }

      // Adjust if tooltip would go off the left edge
      if (left < 10) {
        left = 10;
      }

      // Adjust if tooltip would go off the bottom edge
      if (top + tooltipRect.height > viewportHeight - 10) {
        top = cellRect.top - tooltipRect.height - 8;
      }

      setTooltipPosition({ top, left });
    }
  }, [isHovered]);

  if (!posts || posts.length === 0) {
    return <span className="text-gray-400">0</span>;
  }

  return (
    <td
      ref={cellRef}
      className="relative group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="text-blue-600 hover:text-blue-800 font-medium">
        {posts.length}
      </span>
      {isHovered && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="text-sm font-semibold mb-2">
            Posts ({posts.length})
          </div>
          <div className="max-h-64 overflow-y-auto space-y-3">
            {posts
              .filter(
                (post): post is Post => post !== null && post !== undefined
              )
              .map((post) => (
                <div
                  key={post.id}
                  className="border-b border-gray-700 pb-2 last:border-0"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="font-medium text-blue-300 mb-1">
                        {post.title || "Untitled"}
                      </div>
                      {post.content && (
                        <div className="text-xs text-gray-300 line-clamp-2">
                          {post.content}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      {onEditPost && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditPost(post);
                          }}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded text-white"
                          title="Edit post"
                        >
                          Edit
                        </button>
                      )}
                      {onDeletePost && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePost(post);
                          }}
                          className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded text-white"
                          title="Delete post"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </td>
  );
};
