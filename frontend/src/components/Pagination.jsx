import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

function Pagination({ currentPage, totalCount, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8 mb-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400 text-sm">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 text-sm rounded-md border transition-colors ${
                currentPage === page
                  ? 'bg-[#febd69] text-white font-medium'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Pagination;