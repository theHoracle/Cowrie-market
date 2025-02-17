import Hero from "@/components/hero";
import ProductsGallery from "@/components/products-gallery";

export default async function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <div className="py-4">
        <ProductsGallery />
      </div>
    </div>
  );
}
