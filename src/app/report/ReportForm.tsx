'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { translateApiMessage, useTranslation } from '@/lib/i18n';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export default function ReportPage() {
  const router = useRouter();
  const { t } = useTranslation();
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState('');

  const categories = [
    ['Potholes', 'category.potholes'],
    ['Garbage', 'category.garbage'],
    ['Street Lights', 'category.streetLights'],
    ['Water', 'category.water'],
    ['Drainage', 'category.drainage'],
    ['Roads', 'category.roads'],
    ['Other', 'category.other'],
  ] as const;

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const validateTitle = (title: string): string => {
    if (!title.trim()) return t('report.titleRequired');
    if (title.trim().length < 5) return t('report.titleLength');
    return '';
  };

  const validateCategory = (category: string): string => {
    if (!category) return t('report.categoryRequired');
    return '';
  };

  const validateDescription = (desc: string): string => {
    if (!desc.trim()) return t('report.descriptionRequired');
    if (desc.trim().length < 20) return t('report.descriptionLength');
    return '';
  };

  const validateCoordinates = (lat: string, lon: string): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (lat && lon) {
      const latitude = Number.parseFloat(lat);
      const longitude = Number.parseFloat(lon);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        nextErrors.coordinates = t('report.coordinatesInvalid');
      } else if (latitude < -90 || latitude > 90) {
        nextErrors.latitude = t('report.latitudeRange');
      } else if (longitude < -180 || longitude > 180) {
        nextErrors.longitude = t('report.longitudeRange');
      }
    } else if ((lat && !lon) || (!lat && lon)) {
      nextErrors.coordinates = t('report.coordinatesBoth');
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

    const fileType = file.type.toLowerCase();
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!acceptedTypes.includes(fileType)) {
      setErrors((prev) => ({
        ...prev,
        photo: t('report.photoInvalid'),
      }));
      setPhotoName('');
      setPhotoPreview(null);
      setFormData((prev) => ({
        ...prev,
        photo: null,
      }));
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setErrors((prev) => ({
        ...prev,
        photo: t('report.photoTooLarge'),
      }));
      setPhotoName('');
      setPhotoPreview(null);
      setFormData((prev) => ({
        ...prev,
        photo: null,
      }));
      return;
    }

    setPhotoName(file.name);
    setPhotoPreview((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
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
    setLocationStatus(t('report.gettingLocation'));

    if (!navigator.geolocation) {
      setLocationStatus(t('report.geolocationUnsupported'));
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
        setLocationStatus(t('report.locationSuccess'));
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus(
            t('report.locationDenied')
          );
        } else {
          setLocationStatus(t('report.locationFailed'));
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

      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('category', formData.category);
      formPayload.append('description', formData.description);
      formPayload.append('latitude', formData.latitude);
      formPayload.append('longitude', formData.longitude);
      formPayload.append('location', '');

      if (formData.photo) {
        formPayload.append('photo', formData.photo);
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formPayload,
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        errors?: Record<string, string>;
        report?: { id?: string };
      };

      if (!response.ok || !data.success) {
        if (data.errors) {
          setErrors({
            ...nextErrors,
            ...Object.fromEntries(
              Object.entries(data.errors).map(([key, message]) => [
                key,
                translateApiMessage(message, t, 'report.validationError'),
              ])
            ),
          });
        }
        setSubmitState({
          success: false,
          message: translateApiMessage(data.message, t, 'report.submitError'),
        });
        return;
      }

      setSubmitState({
        success: true,
        message: translateApiMessage(data.message, t, 'report.submittedSuccess'),
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
      setPhotoPreview((current) => {
        if (current?.startsWith('blob:')) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
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
        message: t('report.submitError'),
      });
      setErrors((prev) => ({
        ...prev,
        submit: t('report.submitError'),
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('report.submitted')}</h2>
              <p className="text-gray-600 mb-6">{submitState.message}</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  {t('report.savedPending')}
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmitState(null);
                }}
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                {t('report.submitAnother')}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {t('report.title')}
                </h1>
                <p className="text-gray-600 text-lg">
                  {t('report.intro')}
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
                    {t('report.issueInformation')}
                  </h2>

                  <div className="mb-6">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t('report.issueTitle')} *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('report.titlePlaceholder')}
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
                      {t('common.category')} *
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
                      <option value="">{t('report.selectCategory')}</option>
                      {categories.map(([value, key]) => (
                        <option key={value} value={value}>
                          {t(key)}
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
                      {t('common.description')} *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder={t('report.descriptionPlaceholder')}
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
                    <p className="text-gray-500 text-xs mt-1">{t('report.minimumCharacters')}</p>
                  </div>
                </section>

                <section className="border-b border-gray-200 pb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {t('report.photoOptional')}
                  </h2>
                  <div>
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t('report.uploadPhoto')}
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        id="photo"
                        name="photo"
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/webp"
                        disabled={isSubmitting}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{t('report.photoTypes')}</p>
                    {photoName && <p className="text-sm text-gray-600 mt-2">{t('report.selectedPhoto', { name: photoName })}</p>}
                    {photoPreview && (
                      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <img
                          src={photoPreview}
                          alt={t('report.photoPreview')}
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    )}
                    {errors.photo && <p className="text-red-600 text-sm mt-1">{errors.photo}</p>}
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {t('report.locationDetails')}
                  </h2>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('report.coordinates')}
                      </label>
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        {t('report.useMyLocation')}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleChange}
                          placeholder={t('report.latitude')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleChange}
                          placeholder={t('report.longitude')}
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
                  {isSubmitting ? t('report.submitting') : t('report.submit')}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
