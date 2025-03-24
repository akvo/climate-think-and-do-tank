import { useState } from 'react';

export default function TopicsFilter({ onApply, onClear, topics, label }) {
  const [selectedTopics, setSelectedTopics] = useState(['All']);

  const handleTopicClick = (topic) => {
    if (topic === 'All') {
      setSelectedTopics(['All']);
      return;
    }

    setSelectedTopics((prev) => {
      const newTopics = prev.filter((t) => t !== 'All');
      if (prev.includes(topic)) {
        return newTopics.filter((t) => t !== topic);
      }
      return [...newTopics, topic];
    });
  };

  const handleClear = () => {
    setSelectedTopics(['All']);
    onClear();
  };

  const handleApply = () => {
    onApply(selectedTopics);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 ">
      <h2 className="text-xl font-bold text-zinc-800">
        {label ? label : 'TOPICS'}
      </h2>

      <div className="flex flex-wrap gap-3">
        {topics.map((topic) => (
          <button
            key={topic}
            onClick={() => handleTopicClick(topic)}
            className={`
        px-4 py-2 
        rounded-full 
        border 
        text-sm
        font-medium
        transition-colors
        ${
          selectedTopics.includes(topic)
            ? 'bg-green-600 border-green-600 text-white'
            : 'border-gray-300 text-gray-700 hover:border-gray-400'
        }
      `}
          >
            {topic}
          </button>
        ))}
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
