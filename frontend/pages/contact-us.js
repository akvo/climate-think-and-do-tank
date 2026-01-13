import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { env } from '@/helpers/env-vars';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Button from '@/components/Button';

export default function ContactPage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: isAuthenticated ? user.full_name : '',
    organization: isAuthenticated ? user.organisation?.name : '',
    email: isAuthenticated ? user.email : '',
    subject: 'Need support in finding investments/funding',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      organization: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${env('NEXT_PUBLIC_BACKEND_URL')}/api/contact/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      toast.success(
        'Your message has been sent successfully. We will get back to you soon!'
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      resetForm();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const inputClassName =
    'w-full px-4 py-3 rounded-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm sm:text-base';

  return (
    <div className="min-h-screen py-16 px-4 bg-white text-black">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Contact Us</h1>
        <p className="text-gray-600 text-center mb-12">
          Need support? The Kenya Drylands Investment Hub supports you in
          increasing investments and building resilience in Kenya&apos;s
          Drylands. Fill in the form below and we will contact you shortly:
        </p>

        <div className="p-8 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-xs sm:text-sm font-semibold text-black"
              >
                Your name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Enter your name"
                className={inputClassName}
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="organization"
                className="block text-xs sm:text-sm font-semibold text-black"
              >
                Organization
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                placeholder="Enter your organization"
                className={inputClassName}
                value={formData.organization}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-semibold text-black"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className={inputClassName}
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="subject"
                className="block text-xs sm:text-sm font-semibold text-black"
              >
                Subject
              </label>
              <div className="relative">
                <select
                  id="subject"
                  name="subject"
                  required
                  className={`${inputClassName} appearance-none pr-10`}
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="Need support in finding investments/funding">
                    Need support in finding investments/funding
                  </option>
                  <option value="Need support in finding investment opportunities">
                    Need support in finding investment opportunities
                  </option>
                  <option value="Need support in finding partners">
                    Need support in finding partners
                  </option>
                  <option value="Need support in data and knowledge">
                    Need support in data and knowledge
                  </option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="block text-xs sm:text-sm font-semibold text-black"
              >
                Enter your message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                placeholder="Give a brief description of your inquiry"
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm sm:text-base"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Submit'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
