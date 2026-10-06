'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ReportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    photo: null as File | null,
    latitude: '',
    longitude: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<{ success: boolean; message: string } | null>(null);
  const [photoName, setPhotoName] = useState('');
  const [locationStatus, setLocationStatus] = useState('');

  const categories = ['Potholes', 'Garbage', 'Street Lights', 'Water', 'Drainage', 'Roads', 'Other'];

  const validateTitle = (title: string): string => {
    if (!title.trim()) return 'Issue title is required';
    if (title.trim().length < 5) return 'Title must be at least 5 characters';
    return '';
  };

  const validateCategory = (category: string): string => {
    if (!category) return 'Please select a category';
    return '';
  };

  const validateDescription = (desc: string): string => {
    if (!desc.trim()) return 'Description is required';
    if (desc.trim().length < 20) return 'Description must be at least 20 characters';
    return '';
  };

  const validateCoordinates = (lat: string, lon: string): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (lat && lon) {
      const latitude = Number.parseFloat(lat);
      const longitude = Number.parseFloat(lon);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        nextErrors.coordinates = 'Please enter valid numbers for coordinates';
      } else if (latitude < -90 || latitude > 90) {
        nextErrors.latitude = 'Latitude must be between -90 and 90';
      } else if (longitude < -180 || longitude > 180) {
        nextErrors.longitude = 'Longitude must be between -180 and 180';
      }
    } else if ((lat && !lon) || (!lat && lon)) {
      nextErrors.coordinates = 'Please enter both latitude and longitude, or leave both empty';
    }

    return nextErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Please select a valid image file',
      }));
      setPhotoName('');
      return;
    }

    setPhotoName(file.name);
    setFormData((prev) => ({
      ...prev,
      photo: file,
    }));

    if (errors.photo) {
      setErrors((prev) => ({
        ...prev,
        photo: '',
      }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    let error = '';
    if (name === 'title') {
      error = validateTitle(formData.title);
    } else if (name === 'category') {
      error = validateCategory(formData.category);
    } else if (name === 'description') {
      error = validateDescription(formData.description);
    }

    if (error) {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleUseMyLocation = () => {
    setLocationStatus('Getting location...');

    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setLocationStatus('Location obtained successfully. You can adjust if needed.');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus(
            'Location permission denied. Please enable it in your browser settings.'
          );
        } else {
          setLocationStatus('Unable to get location. Please try again.');
        }
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: Record<string, string> = {};
    nextErrors.title = validateTitle(formData.title);
    nextErrors.category = validateCategory(formData.category);
    nextErrors.description = validateDescription(formData.description);
    const coordinateErrors = validateCoordinates(formData.latitude, formData.longitude);
    Object.assign(nextErrors, coordinateErrors);

    setErrors(nextErrors);
    setTouched({ title: true, category: true, description: true });

    const hasErrors = Object.values(nextErrors).some((error) => error !== '');
    if (hasErrors) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitState(null);

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude,
          location: '',
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        errors?: Record<string, string>;
        report?: { id?: string };
      };

      if (!response.ok || !data.success) {
        if (data.errors) {
          setErrors({ ...nextErrors, ...data.errors });
        }
        setSubmitState({
          success: false,
          message: data.message || 'Unable to submit report right now.',
        });
        return;
      }

      setSubmitState({
        success: true,
        message: data.message || 'Report submitted successfully.',
      });
      setFormData({
        title: '',
        category: '',
        description: '',
        photo: null,
        latitude: '',
        longitude: '',
      });
      setPhotoName('');
      setLocationStatus('');
      setTouched({});
      setErrors({});

      if (data.report?.id) {
        router.push(`/report/${data.report.id}`);
      }
    } catch (error) {
      console.error('Report submission failed:', error);
      setSubmitState({
        success: false,
        message: 'Unable to submit the report right now. Please try again later.',
      });
      setErrors((prev) => ({
        ...prev,
        submit: 'Unable to submit the report right now. Please try again later.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-8 md:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {submitState && submitState.success ? (
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 text-green-500 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Submitted</h2>
              <p className="text-gray-600 mb-6">{submitState.message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  Your civic issue has been saved to the database and is now pending review.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmitState(null);
                }}
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Report a Civic Issue
                </h1>
                <p className="text-gray-600 text-lg">
                  Help improve Baramati by reporting problems in your area.
                </p>
              </div>

              {submitState && !submitState.success && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {submitState.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <section className="border-b border-gray-200 pb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Issue Information
                  </h2>

                  <div className="mb-6">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Issue Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="e.g. Large pothole near main road"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        touched.title && errors.title
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {touched.title && errors.title && (
                      <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        touched.category && errors.category
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">-- Select a category --</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {touched.category && errors.category && (
                      <p className="text-red-600 text-sm mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Please describe the issue in detail. What is the problem? Where exactly is it located? Any other relevant information?"
                      rows={5}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none ${
                        touched.description && errors.description
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {touched.description && errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">Minimum 20 characters</p>
                  </div>
                </section>

                <section className="border-b border-gray-200 pb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Photo (Optional)
                  </h2>
                  <div>
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Upload a Photo
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        id="photo"
                        name="photo"
                        onChange={handleFileChange}
                        accept="image/jpg, image/jpeg, image/png, image/webp"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
                      />
                    </div>
                    {photoName && <p className="text-sm text-gray-600 mt-2">Selected: {photoName}</p>}
                    {errors.photo && <p className="text-red-600 text-sm mt-1">{errors.photo}</p>}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Location Details
                  </h2>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Coordinates
                      </label>
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        Use My Location
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleChange}
                          placeholder="Latitude"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleChange}
                          placeholder="Longitude"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                    </div>

                    {errors.coordinates && (
                      <p className="text-red-600 text-sm mt-1">{errors.coordinates}</p>
                    )}
                    {errors.latitude && (
                      <p className="text-red-600 text-sm mt-1">{errors.latitude}</p>
                    )}
                    {errors.longitude && (
                      <p className="text-red-600 text-sm mt-1">{errors.longitude}</p>
                    )}
                    {locationStatus && (
                      <p className="text-sm text-gray-600 mt-2">{locationStatus}</p>
                    )}
                  </div>
                </section>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
