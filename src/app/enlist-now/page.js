'use client';

import Image from "next/image";
import ResponsiveForm from "../../components/ResponsiveForms";
import { useState, useEffect } from 'react';

export default function Page() {
  const [formsEnabled, setFormsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFormsEnabled = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/frontpage/admin/settings`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const settingsBySection = await response.json();
          const allSettings = Object.values(settingsBySection).flat();
          const formsSetting = allSettings.find(s => s.setting_key === 'enable_forms');
          setFormsEnabled(formsSetting ? formsSetting.setting_value === 'true' : false);
        } else {
          // If API fails, assume forms are disabled for security
          setFormsEnabled(false);
        }
      } catch (error) {
        console.error('Failed to check forms status:', error);
        setFormsEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    checkFormsEnabled();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!formsEnabled) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-3xl font-bold text-white mb-4">Forms Temporarily Disabled</h1>
          <p className="text-gray-400 text-lg">
            Registration forms are currently disabled. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return <ResponsiveForm />;
}