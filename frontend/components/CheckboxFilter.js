import { useState, useEffect } from 'react';

export default function CheckboxFilter({
  onApply,
  onClear,
  options,
  label,
  initialSelected = [],
  hasAllOption = false,
  allOptionLabel,
}) {
  const [selectedOptions, setSelectedOptions] = useState(() => {
    if (initialSelected && initialSelected.length > 0) {
      return initialSelected;
    } else if (hasAllOption) {
      return ['All', ...(options || [])];
    } else {
      return [];
    }
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialSelected && initialSelected.length > 0) {
      setSelectedOptions(initialSelected);
    } else if (
      initialSelected.length === 0 &&
      options?.length > 0 &&
      hasAllOption
    ) {
      setSelectedOptions(['All', ...options]);
    }
  }, [initialSelected, options, hasAllOption]);

  const allSelected =
    options?.length > 0 &&
    options.every((option) => selectedOptions.includes(option)) &&
    selectedOptions.includes('All');

  const handleOptionToggle = (option) => {
    setSelectedOptions((prev) => {
      if (prev.includes(option)) {
        const newSelection = prev.filter((item) => item !== option);

        if (option !== 'All') {
          return newSelection.filter((item) => item !== 'All');
        }

        return newSelection;
      } else {
        const newSelection = [...prev, option];

        if (
          option !== 'All' &&
          options.every((opt) => opt === option || newSelection.includes(opt))
        ) {
          return [...newSelection, 'All'];
        }

        if (option === 'All') {
          return ['All', ...options];
        }

        return newSelection;
      }
    });
  };

  const handleMasterToggle = () => {
    if (allSelected) {
      setSelectedOptions([]);
    } else {
      setSelectedOptions(['All', ...(options || [])]);
    }
  };

  const handleClear = () => {
    setSelectedOptions([]);
    setSearchTerm('');
    onClear();
  };

  const handleApply = () => {
    onApply(selectedOptions);
  };

  const filteredOptions = (options || []).filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-6">
      <h2 className="text-xl font-bold text-zinc-800">{label || 'Filter'}</h2>

      {(options?.length || 0) > 10 && (
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md pl-8"
          />
          <svg
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      )}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {hasAllOption && (
          <>
            <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleMasterToggle}
                className="h-5 w-5 text-green-600 border-gray-300 rounded"
              />
              <span
                className={`ml-3 ${
                  allSelected ? 'font-medium text-green-600' : 'text-gray-700'
                }`}
              >
                {allOptionLabel ? allOptionLabel : 'All Options'}
              </span>
            </label>
            <div className="border-t border-gray-200 my-2"></div>
          </>
        )}

        {filteredOptions.map((option) => (
          <label
            key={option}
            className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleOptionToggle(option)}
              className="h-5 w-5 text-green-600 border-gray-300 rounded"
            />
            <span
              className={`ml-3 ${
                selectedOptions.includes(option)
                  ? 'font-medium text-green-600'
                  : 'text-gray-700'
              }`}
            >
              {option}
            </span>
          </label>
        ))}

        {filteredOptions.length === 0 && (
          <p className="text-gray-500 text-center py-2">
            No options match your search
          </p>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          onClick={handleClear}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="px-8 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
