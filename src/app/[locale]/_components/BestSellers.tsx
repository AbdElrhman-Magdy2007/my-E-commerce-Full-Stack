import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { getBestSellers } from "@/server/db/products";

async function BestSellers() {
  const products = await getBestSellers(4); // رقم 3 يشير الي limit الذي موجود فيصفحهproducts.ts

  return (
    <section>
      {/* container */}
      <div className="">
        <div className="text-center mb-4">
          <MainHeading subTitle="checkOut" title="Our Best Sellers" />  {/* subTitle={products.checkOut للتاكت من الرجمه } title={products.OurBestSellers} */}
        </div>
        <Menu items={products} />
      </div>
    </section>
  );
}

export default BestSellers;
