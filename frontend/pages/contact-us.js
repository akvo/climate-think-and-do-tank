import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-white text-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Contact Us</h1>
        <p className="text-gray-600 text-center mb-12">
          Need support? The Think and Do Tank Network supports you in increasing
          investments and building resilience in Kenya's Drylands. Fill in the
          form below and we contact you shortly:
        </p>

        <div className="bg-[#f7f7f7] p-8 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-md bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="organization"
                className="block text-sm font-medium"
              >
                Organization
              </label>
              <div className="relative">
                <select
                  id="organization"
                  name="organization"
                  required
                  className="w-full px-4 py-3 rounded-md bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                  value={formData.organization}
                  onChange={handleChange}
                >
                  <option value="">Your organization</option>
                  <option value="org1">Organization 1</option>
                  <option value="org2">Organization 2</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-3.5 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-md bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-medium">
                Subject
              </label>
              <div className="relative">
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 rounded-md bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="">
                    Need support in finding investment opportunities
                  </option>
                  <option value="subject1">Other Subject 1</option>
                  <option value="subject2">Other Subject 2</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-3.5 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium">
                Enter your message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                placeholder="Give a brief resource description"
                className="w-full px-4 py-3 rounded-md bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
