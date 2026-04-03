import DashboardClient from "@/components/dashboard-client";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "Dashboard — ImageBackgroundRemover",
};

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <DashboardClient />
      </main>
      <Footer />
    </>
  );
}
