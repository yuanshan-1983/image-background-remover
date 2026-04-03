import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import BatchRemover from "@/components/batch-remover";

export const metadata = {
  title: "Batch Remove Backgrounds — ImageBackgroundRemover",
  description: "Remove backgrounds from up to 20 images at once. Pro feature.",
};

export default function BatchPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <BatchRemover />
      </main>
      <Footer />
    </>
  );
}
