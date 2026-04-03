import BackgroundRemover from "@/components/background-remover";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const useCases = [
  {
    icon: "👤",
    title: "For individuals",
    desc: "Create profile photos, greeting cards, and social media posts with clean cutouts."
  },
  {
    icon: "📸",
    title: "For photographers",
    desc: "Speed up your editing workflow and deliver transparent backgrounds in bulk."
  },
  {
    icon: "🛒",
    title: "For e-commerce",
    desc: "Clean product photos for Amazon, Shopify, Etsy, and any marketplace listing."
  },
  {
    icon: "📣",
    title: "For marketing",
    desc: "Design banners, ads, and creatives without opening Photoshop."
  },
  {
    icon: "💻",
    title: "For developers",
    desc: "Integrate background removal into your app with our simple API workflow."
  },
  {
    icon: "🏢",
    title: "For enterprise",
    desc: "Scale image processing across teams with managed usage and quotas."
  }
];

const steps = [
  {
    num: "1",
    title: "Upload your image",
    desc: "Drag and drop or click to select a JPG, PNG, or WEBP file."
  },
  {
    num: "2",
    title: "AI removes the background",
    desc: "Our AI processes the image in seconds with no manual editing needed."
  },
  {
    num: "3",
    title: "Download transparent PNG",
    desc: "Get a clean, high-quality PNG with transparent background instantly."
  }
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-cyan-400 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-32">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Remove Image Background
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-blue-100 sm:text-xl">
            100% Automatic and <span className="font-bold text-white">Free</span>
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-blue-200 sm:text-base">
            Upload your photo and get a clean transparent PNG in seconds.
            No image storage. Powered by AI.
          </p>

          {/* Upload Area */}
          <div className="mx-auto mt-10 max-w-2xl">
            <BackgroundRemover />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-base text-gray-600">
            Three simple steps to remove any image background.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
                  {step.num}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Built for everyone
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-base text-gray-600">
            Whether you need one cutout or thousands, we have you covered.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-lg"
              >
                <span className="text-3xl">{item.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="hero-gradient py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <p className="text-4xl font-bold text-white">5</p>
              <p className="mt-2 text-sm text-blue-200">Free removals per day</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">&lt; 5s</p>
              <p className="mt-2 text-sm text-blue-200">Average processing time</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white">100%</p>
              <p className="mt-2 text-sm text-blue-200">Automatic — no manual editing</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-4">
            {[
              {
                q: "Do you store my images?",
                a: "No. Images are processed in memory only and are never saved on our servers."
              },
              {
                q: "What file types are supported?",
                a: "We support JPG, PNG, and WEBP uploads. The output is always a transparent PNG."
              },
              {
                q: "Is it really free?",
                a: "Yes! You get 5 free background removals per day after signing in with Google."
              },
              {
                q: "Do I need to sign up?",
                a: "Just sign in with your Google account — no separate registration needed."
              },
              {
                q: "What if the result isn't perfect?",
                a: "Complex edges like hair, glass, or fine details may vary. Try using a higher-resolution source image for best results."
              }
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900">{item.q}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
