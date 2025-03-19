import React, { useState, useEffect, useRef } from 'react';

/**
 * CustomDropdown - A reusable dropdown component with single or multi-select functionality
 *
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the dropdown
 * @param {string} props.label - Label text for the dropdown
 * @param {Array} props.options - Array of options objects with { id, label } structure
 * @param {boolean} props.isMulti - Whether to allow multiple selections
 * @param {Array|string|number} props.value - Currently selected value(s)
 * @param {Function} props.onChange - Callback function when selection changes
 * @param {string} props.placeholder - Placeholder text when no selection
 * @param {string} props.className - Additional class names for the container
 * @param {boolean} props.disabled - Whether the dropdown is disabled
 * @param {boolean} props.searchable - Whether to show search input
 * @param {boolean} props.alphabetical - Whether to sort options alphabetically
 */
const CustomDropdown = ({
  id,
  label,
  options = [],
  isMulti = false,
  value = isMulti ? [] : '',
  onChange,
  placeholder = 'Select option',
  className = '',
  disabled = false,
  searchable = false,
  alphabetical = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Reset search term when dropdown closes
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen, searchable]);

  // Get selected item(s) for display
  const getSelectedItems = () => {
    if (isMulti) {
      return options.filter(
        (option) => Array.isArray(value) && value.includes(option.id)
      );
    } else {
      return options.find((option) => option.id === value) || null;
    }
  };

  // Handle selection of an option
  const handleSelect = (optionId) => {
    if (isMulti) {
      // For multi-select, toggle the selection
      const isSelected = Array.isArray(value) && value.includes(optionId);
      if (isSelected) {
        onChange(value.filter((id) => id !== optionId));
      } else {
        onChange([...value, optionId]);
      }
    } else {
      // For single-select, set the value and close dropdown
      onChange(optionId);
      setIsOpen(false);
    }
  };

  // Remove a selected item (for multi-select)
  const removeItem = (e, optionId) => {
    e.stopPropagation();
    if (isMulti) {
      onChange(value.filter((id) => id !== optionId));
    }
  };

  // Get filtered and sorted options
  const getFilteredOptions = () => {
    let filteredOptions = [...options];

    // Apply search filter if search term exists
    if (searchable && searchTerm) {
      filteredOptions = filteredOptions.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort alphabetically if needed
    if (alphabetical) {
      filteredOptions.sort((a, b) => a.label.localeCompare(b.label));
    }

    return filteredOptions;
  };

  // Get selected items for display
  const selectedItems = getSelectedItems();
  const filteredOptions = getFilteredOptions();

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-lg font-medium text-gray-700">
          {label}
        </label>
      )}

      <div ref={dropdownRef} className="relative">
        {/* Main dropdown button */}
        <div
          className={`w-full p-4 py-2 bg-white border border-gray-200 rounded-full flex flex-wrap gap-2 min-h-10 cursor-pointer
            ${
              disabled
                ? 'bg-gray-100 cursor-not-allowed'
                : 'hover:border-gray-300'
            }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          id={id}
        >
          {/* Display selected items */}
          {isMulti ? (
            <>
              {Array.isArray(selectedItems) && selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-[12px]"
                  >
                    {item.label}
                    <button
                      type="button"
                      onClick={(e) => removeItem(e, item.id)}
                      className="text-gray-500 hover:text-gray-700"
                      disabled={disabled}
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </>
          ) : (
            // Single-select text
            <span className={selectedItems ? '' : 'text-gray-500'}>
              {selectedItems ? selectedItems.label : placeholder}
            </span>
          )}
        </div>

        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>

        {/* Dropdown menu */}
        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            <div className="p-2 max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleSelect(option.id)}
                  >
                    {isMulti && (
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(value) && value.includes(option.id)
                        }
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    )}
                    <span className={`${isMulti ? 'ml-2' : ''}`}>
                      {option.label}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-gray-500">
                  {searchTerm ? 'No matching options' : 'No options available'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;
