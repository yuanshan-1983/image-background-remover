import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "API Documentation — ImageBackgroundRemover",
  description: "Integrate background removal into your app with our simple REST API.",
};

export default function ApiDocsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">API Documentation</h1>
        <p className="mt-3 text-base text-gray-600">
          Remove image backgrounds programmatically. Simple REST API with credit-based billing.
        </p>

        {/* Authentication */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Authentication</h2>
          <p className="mt-2 text-sm text-gray-600">
            Include your API key in the <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">Authorization</code> header.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm text-green-400">
{`Authorization: Bearer ibgr_your_api_key_here`}
          </pre>
        </section>

        {/* Remove Background */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Remove Background</h2>
          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm">
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">POST</span>
              <code className="ml-2 text-sm text-gray-900">/api/v1/remove-background</code>
            </p>
            <p className="mt-3 text-sm text-gray-600">
              Upload an image as <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">multipart/form-data</code> with
              the field name <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">image_file</code>.
            </p>
          </div>

          <h3 className="mt-6 text-base font-semibold text-gray-900">Request</h3>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm text-green-400">
{`curl -X POST \\
  https://imagebackgroundremover.club/api/v1/remove-background \\
  -H "Authorization: Bearer ibgr_your_api_key_here" \\
  -F "image_file=@photo.jpg" \\
  -o result.png`}
          </pre>

          <h3 className="mt-6 text-base font-semibold text-gray-900">Response</h3>
          <div className="mt-2 space-y-2 text-sm text-gray-600">
            <p><strong>Success (200):</strong> PNG image binary. Check <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">X-Credits-Remaining</code> header for your balance.</p>
            <p><strong>401:</strong> Invalid or missing API key.</p>
            <p><strong>403:</strong> No credits remaining.</p>
            <p><strong>400:</strong> Invalid file type or file too large.</p>
          </div>
        </section>

        {/* Supported Formats */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Supported Formats</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {["JPEG / JPG", "PNG", "WEBP"].map((f) => (
              <div key={f} className="rounded-xl border border-gray-200 bg-white p-4 text-center text-sm font-medium text-gray-700">
                {f}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500">Maximum file size: 10 MB. Output is always PNG with transparent background.</p>
        </section>

        {/* Pricing */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">API Pricing</h2>
          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-2xl font-bold text-gray-900">$0.05</p>
                <p className="mt-1 text-sm text-gray-500">per image processed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">100</p>
                <p className="mt-1 text-sm text-gray-500">free credits on signup</p>
              </div>
            </div>
          </div>
        </section>

        {/* Get Started */}
        <section className="mt-10 rounded-2xl bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Get Started</h2>
          <ol className="mt-3 space-y-2 text-sm text-gray-600">
            <li><strong>1.</strong> Sign in with Google at the dashboard.</li>
            <li><strong>2.</strong> Go to Dashboard → API Keys → Create a new key.</li>
            <li><strong>3.</strong> Use the key in your API requests.</li>
            <li><strong>4.</strong> Each new key comes with 100 free credits.</li>
          </ol>
        </section>
      </main>
      <Footer />
    </>
  );
}
