import Navbar from '@/components/Navbar';

export default function Home() {
  const categories = [
    { name: 'Potholes', icon: '🕳️' },
    { name: 'Garbage', icon: '🗑️' },
    { name: 'Street Lights', icon: '💡' },
    { name: 'Water', icon: '💧' },
    { name: 'Drainage', icon: '🌊' },
    { name: 'Roads', icon: '🛣️' },
  ];

  const steps = [
    {
      number: '1',
      title: 'Report',
      description: 'Capture a photo, add location, and describe the civic issue',
    },
    {
      number: '2',
      title: 'Track',
      description: 'Monitor the status of your report in real-time',
    },
    {
      number: '3',
      title: 'Resolve',
      description: 'Administrators work to resolve the issue and notify you',
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
                Make Baramati Better
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Report civic problems like potholes, garbage, street lights, and water issues.
                Together, we can create a better city for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Report an Issue
                </a>
                <a
                  href="#"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
                >
                  View Reports
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              How It Works
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
              Report These Issues
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
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Your voice matters. Report issues and help build a cleaner, safer Baramati for all citizens.
            </p>
            <a
              href="#"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Start Reporting Now
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
                  A civic issue reporting platform empowering citizens to make Baramati better.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/" className="hover:text-white transition">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Report Issue
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Browse Reports
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h3 className="text-white font-bold text-lg mb-4">Support</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition">
                      FAQ
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
                <p className="text-sm mb-2">Email: info@fixmybaramati.in</p>
                <p className="text-sm">Phone: +91 XXX XXX XXXX</p>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>
                &copy; 2024 FixMyBaramati. All rights reserved. | Privacy Policy | Terms of Service
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
