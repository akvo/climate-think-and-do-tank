import { useState } from 'react';
import Image from 'next/image';
import {
  Globe,
  MapPin,
  LinkIcon,
  X,
  Mail,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';

export default function OrganizationModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowSuccess(true);
    setFormData({ name: '', email: '', message: '' });

    // Reset success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setIsFormOpen(false);
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const associatedContent = [
    {
      type: 'FINANCING RESOURCE',
      title:
        'Implementing Sustainable Low and Non-Chemical Development in SIDS (ISL ANDS)',
      image: 'https://placehold.co/400x200',
    },
    {
      type: 'FINANCING RESOURCE',
      title: 'Promotion of Countermeasures Against Marine Plastic Litter',
      image: 'https://placehold.co/400x200',
    },
    {
      type: 'FINANCING RESOURCE',
      title: 'Project to tackle marine litter and plastic pollution',
      image: 'https://placehold.co/400x200',
    },
  ];

  const members = [
    {
      name: 'Ouma Odhiambo',
      role: 'Regional Coordinator on Chemicals and Pollution',
      avatar: 'https://placehold.co/80x80',
    },
    {
      name: 'Ouma Odhiambo',
      role: 'Regional Coordinator on Chemicals and Pollution',
      avatar: 'https://placehold.co/80x80',
    },
    {
      name: 'Ouma Odhiambo',
      role: 'Regional Coordinator on Chemicals and Pollution',
      avatar: 'https://placehold.co/80x80',
    },
  ];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-green-600 text-sm font-semibold mb-2">
                ORGANIZATION
              </div>
              <h2 className="text-2xl font-bold mb-4 text-black">
                United Nations Environment Programme (UNEP)
              </h2>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  Kenya
                </div>
                <div className="flex items-center gap-1">
                  <Globe size={16} />
                  Global
                </div>
                <a
                  href="https://www.unep.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <LinkIcon size={16} />
                  https://www.unep.org/
                </a>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content sections... (keeping existing content) */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div className="col-span-1">
              <Image
                src="https://placehold.co/400x200"
                alt="UNEP Logo"
                width={200}
                height={200}
                className="w-full"
                unoptimized
              />
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 mb-4">
                The United Nations Environment Programme (UNEP) is the leading
                global environmental authority that sets the global
                environmental agenda, promotes the coherent implementation of
                the environmental dimension of sustainable development within
                the United Nations system, and serves as an authoritative
                advocate for the global environment.
              </p>
              <p className="text-gray-600">
                Our mission is to provide leadership and encourage partnership
                in caring for the environment by inspiring, informing, and
                enabling nations and peoples to improve their quality of life
                without compromising that of future generations.
              </p>
            </div>
          </div>

          {/* Associated Content */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-600 mb-4">
              ASSOCIATED CONTENT
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {associatedContent.map((content, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-green-600 text-xs font-semibold mb-2">
                    {content.type}
                  </div>
                  <h4 className="font-medium mb-4 text-black">
                    {content.title}
                  </h4>
                  <Image
                    src={content.image}
                    alt={content.title}
                    width={300}
                    height={200}
                    className="w-full rounded-lg"
                    unoptimized
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 gap-2">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-gray-800' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Individual Members */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-green-600 mb-4">
              INDIVIDUAL MEMBERS
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {members.map((member, index) => (
                <div key={index} className="gap-4">
                  <div className="text-xs font-semibold text-green-600 mb-2">
                    INDIVIDUAL
                  </div>
                  <div className="flex items-start gap-4">
                    <div>
                      <h4 className="font-medium text-black">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.role}</p>
                    </div>
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={80}
                      height={80}
                      className="rounded-full"
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="border-t pt-8">
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold"
            >
              <Mail size={20} />
              Contact Us
              {isFormOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {isFormOpen && (
              <div className="mt-6">
                {!showSuccess ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 text-green-600 text-center">
                    Thank you for your message! We will get back to you soon.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
