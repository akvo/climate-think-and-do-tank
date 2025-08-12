import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, RotateCcw, Check, Filter, X } from 'lucide-react';
import {
  CalenderIcon,
  RegionIcon,
  TopicIcon,
  TypeIcon,
  ValueChainIcon,
} from './Icons';
import Button from './Button';
import { useDispatch, useSelector } from 'react-redux';
import { generateYearOptions } from '@/helpers/utilities';

export default function FilterSection({
  filters = {},
  onFilterChange,
  onClearFilters,
  visibleFilters = ['region', 'topic', 'type', 'year', 'valueChain'],
  isStakeholderDirectory = false,
  isNewsEvents = false,
  className = '',
}) {
  const {
    topics = [],
    regions = [],
    valueChains = [],
  } = useSelector((state) => state.auth);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [tempSelections, setTempSelections] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filterConfigs = {
    region: {
      label: 'Region',
      icon: RegionIcon,
      hasAllOption: true,
      allOptionLabel: 'All locations',
      options: [
        ...regions.map((region) => ({
          value: region.name,
          label: region.name,
        })),
        { value: 'No Specific Region', label: 'No Specific Region' },
      ],
    },
    topic: {
      label: 'Topic',
      icon: TopicIcon,
      hasAllOption: true,
      allOptionLabel: 'All topics',
      options: [
        ...topics.map((topic) => ({
          value: topic.name,
          label: topic.name,
        })),
      ],
    },
    valueChain: {
      label: 'Value chain',
      icon: ValueChainIcon,
      hasAllOption: true,
      allOptionLabel: 'All value chains',
      options: [
        ...valueChains.map((topic) => ({
          value: topic.name,
          label: topic.name,
        })),
      ],
    },
    type: {
      label: 'Type',
      icon: TypeIcon,
      hasAllOption: false,
      options: isStakeholderDirectory
        ? [
            { value: 'Individual', label: 'Individual' },
            { value: 'Organization', label: 'Organization' },
          ]
        : isNewsEvents
        ? [
            { value: 'News', label: 'News' },
            { value: 'Events', label: 'Events' },
          ]
        : [
            { value: 'File', label: 'File' },
            { value: 'Link', label: 'Link' },
          ],
    },
    year: {
      label: 'Year',
      icon: CalenderIcon,
      hasAllOption: true,
      allOptionLabel: 'All years',
      options: [
        ...generateYearOptions().map((year) => ({
          value: year,
          label: year.toString(),
        })),
      ],
    },
  };

  useEffect(() => {
    if (openDropdown) {
      setTempSelections({
        [openDropdown]: filters[openDropdown] || [],
      });
    }
  }, [openDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setTempSelections({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleDropdownToggle = (filterKey) => {
    setOpenDropdown(openDropdown === filterKey ? null : filterKey);
  };

  const handleTempSelection = (filterKey, value) => {
    const currentSelections = tempSelections[filterKey] || [];
    const isSelected = currentSelections.includes(value);

    let newSelections;
    if (isSelected) {
      newSelections = currentSelections.filter((item) => item !== value);
    } else {
      newSelections = [...currentSelections, value];
    }

    setTempSelections((prev) => ({
      ...prev,
      [filterKey]: newSelections,
    }));
  };

  const handleAllSelection = (filterKey) => {
    const currentSelections = tempSelections[filterKey] || [];
    const config = filterConfigs[filterKey];
    const allValues = config.options.map((opt) => opt.value);
    const isAllSelected = allValues.every((value) =>
      currentSelections.includes(value)
    );

    setTempSelections((prev) => ({
      ...prev,
      [filterKey]: isAllSelected ? [] : allValues,
    }));
  };

  const handleApply = (filterKey) => {
    const selections = tempSelections[filterKey] || [];
    onFilterChange(filterKey, selections);
    setOpenDropdown(null);
    setTempSelections({});
  };

  const handleClearFilter = (filterKey) => {
    setTempSelections((prev) => ({
      ...prev,
      [filterKey]: [],
    }));
  };

  const getSelectedLabel = (filterKey) => {
    const selectedValues = filters[filterKey] || [];
    if (selectedValues.length === 0) return filterConfigs[filterKey].label;
    if (selectedValues.length === 1) {
      const option = filterConfigs[filterKey].options.find(
        (opt) => opt.value === selectedValues[0]
      );
      return option ? option.label : filterConfigs[filterKey].label;
    }
    return `${selectedValues.length} selected`;
  };

  const hasActiveFilters = Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : value
  );

  const activeFilterCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) return count + value.length;
    return value ? count + 1 : count;
  }, 0);

  return (
    <>
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 bg-white rounded-full px-4 py-3 shadow-lg w-full"
        >
          <Filter className="w-5 h-5 text-primary-500" />
          <span className="font-medium text-black">Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-auto bg-primary-500 text-white text-xs rounded-full px-2 py-1">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div
        className={`hidden lg:block bg-white rounded-full p-1 shadow-lg backdrop-blur-sm ${className}`}
        ref={dropdownRef}
      >
        <div className="flex items-center">
          {visibleFilters.map((filterKey, index) => {
            const config = filterConfigs[filterKey];
            const Icon = config.icon;
            const selectedValues = filters[filterKey] || [];
            const isSelected = selectedValues.length > 0;
            const isOpen = openDropdown === filterKey;
            const tempSelections_current = tempSelections[filterKey] || [];
            const allValues = config.options.map((opt) => opt.value);
            const isAllSelectedInTemp =
              config.hasAllOption &&
              allValues.every((value) =>
                tempSelections_current.includes(value)
              );

            return (
              <React.Fragment key={filterKey}>
                <div className="relative flex-1 min-w-0">
                  <button
                    onClick={() => handleDropdownToggle(filterKey)}
                    className={`group flex items-center gap-3 w-full p-4 rounded-full transition-all duration-200  ${
                      isSelected || isOpen
                        ? 'bg-primary-50 text-primary-500 border-none'
                        : 'hover:bg-primary-50 text-[#21252B] hover:text-primary-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span
                      className={`font-bold text-sm truncate ${
                        isOpen ? 'text-primary-600' : ''
                      }`}
                    >
                      {getSelectedLabel(filterKey)}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ml-auto ${
                        isOpen ? 'rotate-180 ' : ''
                      } `}
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden min-w-80">
                      <div className="py-2 max-h-80 overflow-y-auto">
                        {config.hasAllOption && (
                          <>
                            <button
                              onClick={() => handleAllSelection(filterKey)}
                              className="w-full text-left px-4 py-3 transition-colors duration-150 hover:bg-primary-50 flex items-center gap-3"
                            >
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                  isAllSelectedInTemp
                                    ? 'bg-primary-500 border-primary-500'
                                    : 'border-gray-400 hover:border-primary-300'
                                }`}
                              >
                                {isAllSelectedInTemp && (
                                  <Check
                                    className="w-3 h-3 text-white"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  isAllSelectedInTemp
                                    ? 'text-primary-700'
                                    : 'text-gray-900'
                                }`}
                              >
                                {config.allOptionLabel}
                              </span>
                            </button>

                            <div className="mx-4 my-2 border-t border-gray-200"></div>
                          </>
                        )}

                        {config.options.map((option) => {
                          const isChecked = tempSelections_current.includes(
                            option.value
                          );
                          return (
                            <button
                              key={option.value}
                              onClick={() =>
                                handleTempSelection(filterKey, option.value)
                              }
                              className="w-full text-left px-4 py-3 transition-colors duration-150 hover:bg-primary-50 flex items-center gap-3"
                            >
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                  isChecked
                                    ? 'bg-primary-500 border-primary-500'
                                    : 'border-gray-400 hover:border-primary-300'
                                }`}
                              >
                                {isChecked && (
                                  <Check
                                    className="w-3 h-3 text-white"
                                    strokeWidth={3}
                                  />
                                )}
                              </div>
                              <span
                                className={`text-sm ${
                                  isChecked
                                    ? 'text-primary-700 font-medium'
                                    : 'text-[#21252B]'
                                }`}
                              >
                                {option.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-4 border-t flex gap-3 justify-between">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => handleApply(filterKey)}
                          className="px-6"
                        >
                          Apply
                        </Button>
                        <Button
                          onClick={() => handleClearFilter(filterKey)}
                          variant="ghost"
                          size="md"
                          className="text-[#21252B] hover:bg-primary-50 hover:text-primary-500 px-6"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {index < visibleFilters.length - 1 && (
                  <div className="h-8 w-px bg-gray-10 mx-2 flex-shrink-0"></div>
                )}
              </React.Fragment>
            );
          })}

          {hasActiveFilters && (
            <>
              <div className="h-8 w-px bg-gray-10 mx-2 flex-shrink-0"></div>
              <button
                onClick={onClearFilters}
                className="flex items-center gap-2 px-4 py-2 text-primary-500 hover:text-primary-700 hover:bg-primary-50 rounded-full transition-all duration-200 group flex-shrink-0"
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                <span className="font-medium text-sm">Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50  text-black">
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Filters</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
              {visibleFilters.map((filterKey) => {
                const config = filterConfigs[filterKey];
                const Icon = config.icon;
                const selectedValues = filters[filterKey] || [];
                const isOpen = openDropdown === filterKey;
                const tempSelections_current =
                  tempSelections[filterKey] || selectedValues;

                return (
                  <div key={filterKey} className="border-b">
                    <button
                      onClick={() => handleDropdownToggle(filterKey)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-10"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{config.label}</span>
                        {selectedValues.length > 0 && (
                          <span className="bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                            {selectedValues.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4">
                        {config.hasAllOption && (
                          <button
                            onClick={() => handleAllSelection(filterKey)}
                            className="w-full text-left py-2 flex items-center gap-3"
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                config.options.every((opt) =>
                                  tempSelections_current.includes(opt.value)
                                )
                                  ? 'bg-primary-500 border-primary-500'
                                  : 'border-gray-400'
                              }`}
                            >
                              {config.options.every((opt) =>
                                tempSelections_current.includes(opt.value)
                              ) && (
                                <Check
                                  className="w-3 h-3 text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {config.allOptionLabel}
                            </span>
                          </button>
                        )}

                        <div className="max-h-60 overflow-y-auto">
                          {config.options.map((option) => {
                            const isChecked = tempSelections_current.includes(
                              option.value
                            );
                            return (
                              <button
                                key={option.value}
                                onClick={() =>
                                  handleTempSelection(filterKey, option.value)
                                }
                                className="w-full text-left py-2 flex items-center gap-3"
                              >
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isChecked
                                      ? 'bg-primary-500 border-primary-500'
                                      : 'border-gray-400'
                                  }`}
                                >
                                  {isChecked && (
                                    <Check
                                      className="w-3 h-3 text-white"
                                      strokeWidth={3}
                                    />
                                  )}
                                </div>
                                <span className="text-sm">{option.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApply(filterKey)}
                            className="flex-1"
                          >
                            Apply
                          </Button>
                          <Button
                            onClick={() => handleClearFilter(filterKey)}
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  onClearFilters();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1"
                disabled={!hasActiveFilters}
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
