export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600">
      <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            FixMyBaramati
          </h1>
          <p className="text-blue-100">
            Report civic issues in your city
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm mb-4">
              Welcome to FixMyBaramati! Report potholes, garbage, street lights, and more.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <a
              href="/auth/register"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition"
            >
              Register
            </a>
            <a
              href="/auth/login"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg text-center transition"
            >
              Login
            </a>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-500 text-xs text-center">
              Phase 1: Project Foundation
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-12 text-white text-sm">
          <h2 className="font-bold mb-4">Coming Features:</h2>
          <ul className="space-y-2 text-blue-100">
            <li>✓ Report civic issues with photos</li>
            <li>✓ Track report status</li>
            <li>✓ View location on map</li>
            <li>✓ Admin dashboard</li>
            <li>✓ Support for Marathi language</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
