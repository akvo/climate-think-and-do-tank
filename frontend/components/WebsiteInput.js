import { useState } from 'react';
import { Link2 } from 'lucide-react';

const WebsiteInput = () => {
  const [formData, setFormData] = useState({ website: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, website: value });

    if (value && !isValidWebsite(value)) {
      setError('Please enter a valid website URL');
    } else {
      setError('');
    }
  };

  const isValidWebsite = (url) => {
    return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/.test(url);
  };

  const normalizeUrl = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  const handleSubmit = () => {
    if (!formData.website || !isValidWebsite(formData.website)) {
      setError('Please enter a valid website URL');
      return;
    }

    const finalWebsite = normalizeUrl(formData.website);
    console.log('Submitting:', finalWebsite);

    // Proceed with finalWebsite...
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-black">Website</label>
      <div className="relative">
        <input
          type="text"
          placeholder="www.myorg.com"
          className={`w-full px-4 py-3 rounded-full bg-white border ${
            error ? 'border-red-400' : 'border-gray-200'
          } focus:outline-none focus:ring-2 ${
            error ? 'focus:ring-red-400' : 'focus:ring-green-500'
          } pr-10`}
          value={formData.website}
          onChange={handleChange}
        />
        <Link2 className="absolute right-4 top-3.5 text-gray-400" size={20} />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-full"
      >
        Submit
      </button>
    </div>
  );
};

export default WebsiteInput;
