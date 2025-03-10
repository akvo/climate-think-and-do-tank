import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function LocationsFilter({ onApply, onClear, locations }) {
  const [selectedLocations, setSelectedLocations] = useState(['All Locations']);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState(locations);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter(
        (location) =>
          location.toLowerCase().includes(searchQuery.toLowerCase()) &&
          location !== 'All Locations'
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

  const handleLocationClick = (location) => {
    if (location === 'All Locations') {
      setSelectedLocations(['All Locations']);
      return;
    }

    setSelectedLocations((prev) => {
      const newLocations = prev.filter((loc) => loc !== 'All Locations');
      if (prev.includes(location)) {
        return newLocations.filter((loc) => loc !== location);
      }
      return [...newLocations, location];
    });
  };

  const handleClear = () => {
    setSelectedLocations(['All Locations']);
    setSearchQuery('');
    onClear();
  };

  const handleApply = () => {
    onApply(selectedLocations);
  };

  const isAllSelected = selectedLocations.includes('All Locations');

  return (
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold text-zinc-800">LOCATIONS</h2>

        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full py-3 px-4 pr-10 border border-gray-300 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-4 top-3.5">
            <Search size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          <label className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={() => handleLocationClick('All Locations')}
              className="h-5 w-5 text-green-600 border-gray-300 rounded"
            />
            <span
              className={`ml-3 ${
                isAllSelected ? 'font-medium text-green-600' : 'text-gray-700'
              }`}
            >
              All Locations
            </span>
          </label>

          <div className="border-t border-gray-200 my-2"></div>

          {filteredLocations.map(
            (location) =>
              location !== 'All Locations' && (
                <label
                  key={location}
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer text-black"
                >
                  <input
                    type="checkbox"
                    checked={selectedLocations.includes(location)}
                    onChange={() => handleLocationClick(location)}
                    className="h-5 w-5 text-green-600 border-gray-300 rounded"
                  />
                  <span
                    className={`ml-3 ${
                      selectedLocations.includes(location)
                        ? 'font-medium'
                        : 'text-gray-700'
                    } ${isAllSelected ? 'text-gray-400' : ''}`}
                  >
                    {location}
                  </span>
                </label>
              )
          )}

          {filteredLocations.length === 0 && (
            <div className="py-4 text-center text-gray-500">
              No locations found
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-between">
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
