"use client";

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { API_BASE_URL } from '@/utils/api';

export default function AdminFrontPage() {
  const [loading, setLoading] = useState(true);
  const [bannerStatus, setBannerStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [featureToggles, setFeatureToggles] = useState({
    enable_raffle_wheel: false,
    enable_jam_themes: false,
    enable_forms: false,
  });
  const [savingToggles, setSavingToggles] = useState(false);
  const { handleApiResponse, apiFetch } = useAdminAuth();

  useEffect(() => {
    loadBannerStatus();
    loadFeatureToggles();
  }, []);

  const loadBannerStatus = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/frontpage/admin/settings`,
        { credentials: 'include' }
      );

      await handleApiResponse(response, 'load banner status');
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
    } catch (error) {
      console.error('Failed to load banner status:', error);
    } finally {
      setLoading(false);
    }
  }; 

  const loadFeatureToggles = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/frontpage/admin/settings`,
        { credentials: 'include' }
      );

      await handleApiResponse(response, 'load feature toggles');
      const settingsBySection = await response.json();
      const allSettings = Object.values(settingsBySection).flat();

      const toggles = {};
      ['enable_raffle_wheel', 'enable_jam_themes', 'enable_forms'].forEach(key => {
        const setting = allSettings.find(s => s.setting_key === key);
        toggles[key] = setting ? setting.setting_value === 'true' : false;
      });

      setFeatureToggles(toggles);
    } catch (error) {
      console.error('Failed to load feature toggles:', error);
    }
  }; 

  const saveFeatureToggle = async (key, value) => {
    setSavingToggles(true);
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/frontpage/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: value.toString() }),
      }, `save feature toggle ${key}`);

      setFeatureToggles(prev => ({ ...prev, [key]: value }));
      // Dispatch event to notify other components (like layout) of the update
      window.dispatchEvent(new CustomEvent('featureTogglesUpdated'));
      alert('Feature toggle updated successfully!');
    } catch (error) {
      console.error('Failed to save feature toggle:', error);
      alert('Failed to update feature toggle');
    } finally {
      setSavingToggles(false);
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

      await apiFetch(`${API_BASE_URL}/frontpage/admin/upload-background`, {
        method: 'POST',
        body: formData,
      }, 'upload background image');

      await loadBannerStatus();
      setImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('banner-image-file');
      if (fileInput) fileInput.value = '';
      alert('Background image uploaded successfully!');
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

      {/* Feature Toggles */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">
          ⚙️ Feature Toggles
        </h3>

        <div className="space-y-4">
          {/* Raffle Wheel Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">🎡 Raffle Wheel</h4>
              <p className="text-gray-400 text-sm">Enable or disable the raffle wheel feature</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={featureToggles.enable_raffle_wheel}
                onChange={(e) => saveFeatureToggle('enable_raffle_wheel', e.target.checked)}
                disabled={savingToggles}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Jam Themes Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">🎨 Jam Themes</h4>
              <p className="text-gray-400 text-sm">Enable or disable the jam themes feature</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={featureToggles.enable_jam_themes}
                onChange={(e) => saveFeatureToggle('enable_jam_themes', e.target.checked)}
                disabled={savingToggles}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Forms Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h4 className="text-white font-medium">📝 Forms</h4>
              <p className="text-gray-400 text-sm">Enable or disable the forms feature</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={featureToggles.enable_forms}
                onChange={(e) => saveFeatureToggle('enable_forms', e.target.checked)}
                disabled={savingToggles}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {savingToggles && (
          <div className="mt-4 text-center text-blue-400">
            ⏳ Saving changes...
          </div>
        )}
      </div>
    </div>
  );
}
