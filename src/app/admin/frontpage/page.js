"use client";

import { useState, useEffect } from 'react';

export default function AdminFrontPage() {
  const [loading, setLoading] = useState(true);
  const [bannerStatus, setBannerStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    loadBannerStatus();
  }, []);

  const loadBannerStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/frontpage/admin/settings`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const settingsBySection = await response.json();
        const allSettings = Object.values(settingsBySection).flat();

        const backgroundImage = allSettings.find(
          (s) => s.setting_key === 'hero_background_image'
        );
        const backgroundFilename = allSettings.find(
          (s) => s.setting_key === 'hero_background_filename'
        );

        if (backgroundFilename && backgroundFilename.setting_value) {
          setBannerStatus({
            filename: backgroundFilename.setting_value,
            url: backgroundImage?.setting_value || 'N/A',
            updated_at: backgroundFilename.updated_at,
          });
        } else {
          setBannerStatus(null);
        }
      }
    } catch (error) {
      console.error('Failed to load banner status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/frontpage/admin/upload-background`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      if (response.ok) {
        await loadBannerStatus();
        setImageFile(null);
        // Reset file input
        const fileInput = document.getElementById('banner-image-file');
        if (fileInput) fileInput.value = '';
        alert('Background image uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">🏠 Front Page Settings</h2>
      </div>

      {/* Current Banner Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          🖼️ Current Background Image
        </h3>

        {bannerStatus ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-400 text-2xl">✓</span>
              <div className="flex-1">
                <p className="text-white font-semibold mb-2">Image Uploaded</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-400">Filename:</span>{' '}
                    {bannerStatus.filename}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">URL:</span>{' '}
                    <a
                      href={bannerStatus.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {bannerStatus.url}
                    </a>
                  </p>
                  <p className="text-gray-400">
                    Updated: {new Date(bannerStatus.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-2">Preview:</p>
              <div className="relative w-full h-48 bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={bannerStatus.url}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 text-gray-400">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p>No background image uploaded yet.</p>
              <p className="text-sm mt-1">
                Upload an image below to set it as the homepage background.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Form */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          📤 Upload New Background Image
        </h3>

        <form onSubmit={handleImageUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Image File
            </label>
            <input
              id="banner-image-file"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full px-4 py-3 bg-gray-700 border-2 border-dashed border-blue-500 rounded-lg text-white focus:outline-none focus:border-blue-400"
              required
            />
            <p className="text-sm text-gray-400 mt-2">
              Supported formats: JPG, PNG, WebP. Maximum size: 5MB
            </p>
          </div>

          {imageFile && (
            <div className="bg-gray-700 rounded p-3">
              <p className="text-sm text-gray-300">
                <span className="text-gray-400">Selected:</span> {imageFile.name} (
                {(imageFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !imageFile}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload Image'}
          </button>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-400 text-xl">💡</span>
          <div className="text-sm text-gray-300 space-y-1">
            <p className="font-semibold text-white">Tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use high-quality images (1920x1080 or higher recommended)</li>
              <li>The image will be used as the background for your homepage</li>
              <li>Images are automatically optimized for web display</li>
              <li>The new image will replace the current background</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
