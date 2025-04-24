"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

interface FormData {
  phone: string;
  address: string;
  city: string;
  country: string;
  submit?: string;
}

interface CheckoutFormProps {
  locale: string;
  productId: string;
  product: {
    id: string;
    name: string;
    basePrice: number;
    description: string;
    imagePath: string;
  };
}

function CheckoutForm({ locale, productId, product }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState<FormData>({
    phone: "",
    address: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        phone: session.user.phone || "",
        address: session.user.streetAddress || "",
        city: session.user.city || "",
        country: session.user.country || "",
      });
    }
  }, [session]);
  console.log("NEXT_PUBLIC_STRIPE_PUBLIC_KEY:", process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
  console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    if (!formData.address.trim()) newErrors.address = "العنوان مطلوب";
    if (!formData.city.trim()) newErrors.city = "المدينة مطلوبة";
    if (!formData.country.trim()) newErrors.country = "الدولة مطلوبة";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // تحويل المنتج إلى تنسيق يشبه السلة
      const cart = [
        {
          id: product.id,
          name: product.name,
          basePrice: product.basePrice,
          quantity: 1,
        },
      ];

      console.log("إرسال البيانات:", { cart, shipping: formData, productId });
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          shipping: formData,
          productId,
        }),
      });

      const data = await response.json();
      console.log("استجابة API:", response.status, data);

      if (!response.ok) {
        throw new Error(data.error || "فشل في إنشاء جلسة الدفع");
      }

      const { id: sessionId } = data;
      const stripe = await stripePromise;
      console.log("Stripe instance:", stripe);

      if (!stripe) {
        throw new Error("فشل تحميل Stripe");
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error("خطأ في إعادة التوجيه:", error.message);
        throw error;
      }
    } catch (error: any) {
      console.error("خطأ في معالجة الدفع:", error.message || error);
      setErrors({ ...errors, submit: error.message || "فشل معالجة الدفع" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl p-10 space-y-8 font-sans border border-gray-200">
      <h2 className="text-4xl font-black text-gray-900 font-serif tracking-tight">
        الدفع الآمن
      </h2>
      <div>
        <h3 className="text-2xl font-bold">{product.name}</h3>
        <p className="text-gray-600">{product.description}</p>
        <p className="text-xl font-bold text-green-700">
          {formatCurrency(product.basePrice)}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="phone" className="text-gray-700 font-semibold text-lg">
            رقم الهاتف
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="أدخل رقم هاتفك"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className={`border border-gray-300 rounded-lg p-4 focus:ring-4 focus:ring-blue-500 focus:outline-none font-medium bg-white text-gray-900 shadow-sm ${
              errors.phone ? "border-red-500" : ""
            }`}
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
        </div>

        <div className="space-y-4">
          <Label htmlFor="address" className="text-gray-700 font-semibold text-lg">
            العنوان
          </Label>
          <Textarea
            id="address"
            placeholder="أدخل عنوانك"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className={`border border-gray-300 rounded-lg p-4 focus:ring-4 focus:ring-blue-500 focus:outline-none font-medium bg-white text-gray-900 shadow-sm ${
              errors.address ? "border-red-500" : ""
            }`}
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="city" className="text-gray-700 font-semibold text-lg">
              المدينة
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="أدخل مدينتك"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className={`border border-gray-300 rounded-lg p-4 focus:ring-4 focus:ring-blue-500 focus:outline-none font-medium bg-white text-gray-900 shadow-sm ${
                errors.city ? "border-red-500" : ""
              }`}
            />
            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
          </div>

          <div className="space-y-4">
            <Label htmlFor="country" className="text-gray-700 font-semibold text-lg">
              الدولة
            </Label>
            <Input
              id="country"
              type="text"
              placeholder="أدخل دولتك"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className={`border border-gray-300 rounded-lg p-4 focus:ring-4 focus:ring-blue-500 focus:outline-none font-medium bg-white text-gray-900 shadow-sm ${
                errors.country ? "border-red-500" : ""
              }`}
            />
            {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
          </div>
        </div>

        {errors.submit && <p className="text-red-500 text-center">{errors.submit}</p>}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xl py-4 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-400 focus:outline-none font-extrabold uppercase tracking-wide disabled:opacity-50"
        >
          {isLoading ? "جاري المعالجة..." : `ادفع ${formatCurrency(product.basePrice)}`}
        </Button>
      </form>
    </div>
  );
}

export default CheckoutForm;