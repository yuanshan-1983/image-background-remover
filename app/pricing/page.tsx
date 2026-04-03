import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PricingCards from "@/components/pricing-cards";

export const metadata = {
  title: "Pricing — ImageBackgroundRemover",
  description: "Simple, transparent pricing. Start free, upgrade when you need more.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />

      <section className="hero-gradient py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-blue-200 sm:text-lg">
            Start free. Upgrade when you need more power, higher quality, or API access.
          </p>
        </div>
      </section>

      <section className="-mt-8 px-4 pb-16 sm:px-6">
        <PricingCards />

        <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-blue-200 bg-blue-50 p-5 text-center">
          <p className="text-sm font-semibold text-blue-900">
            💡 Save 33% with annual billing — $79/year instead of $118.80
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-gray-900">Pricing FAQ</h2>
          <div className="mt-10 space-y-4">
            {[
              { q: "Can I use the free plan for commercial purposes?", a: "Yes! The free plan can be used for any purpose, including commercial projects. The only limitation is the daily usage cap and standard resolution output." },
              { q: "What's the difference between Standard and Full HD quality?", a: "Standard quality outputs images up to 1024px on the longest side. Full HD (Pro plan) preserves your original image resolution for the best possible result." },
              { q: "How does batch processing work?", a: "With the Pro plan, you can upload up to 20 images at once. They'll be processed in parallel and you can download them all as a ZIP file." },
              { q: "Can I cancel my Pro subscription anytime?", a: "Yes, you can cancel anytime. Your Pro features remain active until the end of your current billing period." },
              { q: "Do you offer annual billing?", a: "Yes! Annual billing is $79/year — that's $6.58/month, saving you 33% compared to monthly billing." },
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
