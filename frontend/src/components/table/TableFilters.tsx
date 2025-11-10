type TableFiltersProps = {
    searchValue: string
    setSearchValue: (value: string) => void
}

export const TableFilters = ({ searchValue, setSearchValue }: TableFiltersProps) => {
    return (
        <div className="relative">
            <input 
                type="text" 
                placeholder="Search users by name..." 
                value={searchValue} 
                onChange={(e) => setSearchValue(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
            {searchValue && (
                <button
                    onClick={() => setSearchValue("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    type="button"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    )
}