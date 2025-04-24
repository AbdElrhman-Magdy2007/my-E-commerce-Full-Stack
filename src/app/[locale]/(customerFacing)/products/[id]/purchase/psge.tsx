import { notFound } from "next/navigation";
import CheckoutForm from "./_components/CheckoutForm";
import db from "@/server/db/db";

export default async function PurchasePage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const product = await db.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    return notFound();
  }

  return (
    <CheckoutForm
      locale={params.locale}
      productId={params.id}
      product={{
        id: product.id,
        name: product.name,
        basePrice: product.basePrice,
        description: product.description,
        imagePath: product.image,
      }}
    />
  );
}



//  "use client";  // ✅ أضف هذا السطر هنا

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/Label";

// export default function MockPaymentPage() {
//   const [isPaid, setIsPaid] = useState(false);

//   const handlePayment = () => {
//     setTimeout(() => {
//       setIsPaid(true);
//     }, 2000); // محاكاة تأخير الدفع
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <Card className="w-full max-w-md p-4">
//         <CardHeader>
//           <CardTitle>إتمام الدفع</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {isPaid ? (
//             <div className="text-green-600 text-center font-bold text-lg">
//               ✅ تم الدفع بنجاح!
//             </div>
//           ) : (
//             <>
//               <div className="mb-4">
//                 <Label>رقم البطاقة</Label>
//                 <Input placeholder="4242 4242 4242 4242" />
//               </div>
//               <div className="mb-4 flex space-x-2">
//                 <div className="w-1/2">
//                   <Label>تاريخ الانتهاء</Label>
//                   <Input placeholder="12/24" />
//                 </div>
//                 <div className="w-1/2">
//                   <Label>CVV</Label>
//                   <Input placeholder="123" />
//                 </div>
//               </div>
//               <Button onClick={handlePayment} className="w-full">
//                 💳 إتمام الدفع
//               </Button>
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
