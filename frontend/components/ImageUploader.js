import React, { useState, useRef } from 'react';
import { ImagePlus, X, Upload } from 'lucide-react';
import Image from 'next/image';

const ImageUploader = ({
  value,
  onChange,
  className = '',
  placeholder = 'Upload Organization Logo',
  user,
}) => {
  const [previewUrl, setPreviewUrl] = useState(value || null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        onChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        onChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`w-full ${className}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <label className="block text-sm font-semibold mb-2">{placeholder}</label>
      <div
        className="w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center 
        hover:border-green-500 transition-colors cursor-pointer 
        border-gray-200 bg-gray-50"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={previewUrl}
              alt={'profile image'}
              className="w-full h-full object-contain rounded-xl"
              unoptimized
              fill
              onError={(e) => {
                const fallbackEl = document.createElement('div');
                fallbackEl.className =
                  'w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-6xl rounded-full';
                fallbackEl.textContent = (user?.full_name || 'U')
                  .charAt(0)
                  .toUpperCase();

                const parentNode = e.target.parentNode;
                if (parentNode) {
                  e.target.style.display = 'none';
                  parentNode.appendChild(fallbackEl);
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Upload size={40} className="mb-2" />
            <p className="text-sm">Drag and drop or click to upload logo</p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, or JPEG (max. 5MB)
            </p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ImageUploader;
