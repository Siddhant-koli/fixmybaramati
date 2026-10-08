'use client';

import Navbar from '@/components/Navbar';
import { useTranslation } from '@/lib/i18n';

export default function Home() {
  const { t } = useTranslation();
  const categories = [
    { name: t('category.potholes'), icon: '🕳️' },
    { name: t('category.garbage'), icon: '🗑️' },
    { name: t('category.streetLights'), icon: '💡' },
    { name: t('category.water'), icon: '💧' },
    { name: t('category.drainage'), icon: '🌊' },
    { name: t('category.roads'), icon: '🛣️' },
  ];

  const steps = [
    {
      number: '1',
      title: t('home.stepReport'),
      description: t('home.stepReportDescription'),
    },
    {
      number: '2',
      title: t('home.stepTrack'),
      description: t('home.stepTrackDescription'),
    },
    {
      number: '3',
      title: t('home.stepResolve'),
      description: t('home.stepResolveDescription'),
    },
  ];

  return (
    <>
      <Navbar />
      <main className="bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t('home.title')}
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {t('home.intro')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/report"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  {t('home.reportIssue')}
                </a>
                <a
                  href="/reports"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
                >
                  {t('home.viewReports')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t('home.howItWorks')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-lg transition"
                >
                  <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Issue Categories Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              {t('home.categories')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg hover:scale-105 transition"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-gray-900 font-semibold">{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="bg-blue-600 text-white py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('home.ready')}
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              {t('home.readyDescription')}
            </p>
            <a
              href="/report"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              {t('home.startReporting')}
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* About */}
              <div>
                <h3 className="text-white font-bold text-lg mb-4">FixMyBaramati</h3>
                <p className="text-sm">
                  {t('home.about')}
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-bold text-lg mb-4">{t('home.quickLinks')}</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/" className="hover:text-white transition">
                      {t('nav.home')}
                    </a>
                  </li>
                  <li>
                    <a href="/report" className="hover:text-white transition">
                      {t('nav.reportIssue')}
                    </a>
                  </li>
                  <li>
                    <a href="/reports" className="hover:text-white transition">
                      {t('home.browseReports')}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-white font-bold text-lg mb-4">{t('home.support')}</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t('home.helpCenter')}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t('home.contactUs')}
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      {t('home.faq')}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-white font-bold text-lg mb-4">{t('home.contact')}</h3>
                <p className="text-sm mb-2">{t('home.email')}: info@fixmybaramati.in</p>
                <p className="text-sm">{t('home.phone')}: +91 XXX XXX XXXX</p>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>
                &copy; 2024 FixMyBaramati. {t('home.copyright')} | {t('home.privacy')} | {t('home.terms')}
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
