import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';

export default function LocationsFilter({
  onApply,
  onClear,
  locations,
  name,
  initialSelected = [],
}) {
  const availableLocations = useMemo(
    () => locations.filter((loc) => loc !== 'All Locations'),
    [locations]
  );

  const [selectedLocations, setSelectedLocations] = useState(
    initialSelected.length === 0 ? [...availableLocations] : initialSelected
  );

  useEffect(() => {
    if (initialSelected.length === 0) {
      setSelectedLocations([...availableLocations]);
    } else {
      setSelectedLocations(initialSelected);
    }
  }, [initialSelected, availableLocations]);

  const handleMasterToggle = () => {
    if (selectedLocations.length === availableLocations.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations([...availableLocations]);
    }
  };

  const handleLocationToggle = (location) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter((loc) => loc !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const handleClear = () => {
    setSelectedLocations([]);
    onClear();
  };

  const handleApply = () => {
    onApply(selectedLocations);
  };

  const masterChecked =
    availableLocations.length > 0 &&
    selectedLocations.length === availableLocations.length;

  return (
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-zinc-800">
          {name || 'LOCATIONS'}
        </h2>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={masterChecked}
              onChange={handleMasterToggle}
              className="h-5 w-5 text-green-600 border-gray-300 rounded"
            />
            <span
              className={`ml-3 ${
                masterChecked ? 'font-medium text-green-600' : 'text-gray-700'
              }`}
            >
              All Locations
            </span>
          </label>

          <div className="border-t border-gray-200 my-2"></div>

          {availableLocations.map((location) => (
            <label
              key={location}
              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedLocations.includes(location)}
                onChange={() => handleLocationToggle(location)}
                className="h-5 w-5 text-green-600 border-gray-300 rounded"
              />
              <span
                className={`ml-3 ${
                  selectedLocations.includes(location)
                    ? 'font-medium text-green-600'
                    : 'text-gray-700'
                }`}
              >
                {location}
              </span>
            </label>
          ))}

          {availableLocations.length === 0 && (
            <div className="py-4 text-center text-gray-500">
              No locations found
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 rounded-b-xl flex justify-between">
        <button
          onClick={handleClear}
          className="text-gray-600 font-medium hover:text-gray-800"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="px-8 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 font-medium"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
