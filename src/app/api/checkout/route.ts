import { NextResponse } from "next/server";
import Stripe from "stripe";

console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY); // تسجيل المفتاح

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function getStripeLineItems(cart: any[]) {
  return cart.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
      },
      unit_amount: item.basePrice * 100,
    },
    quantity: item.quantity,
  }));
}

export async function POST(req: Request) {
  try {
    const { cart, shipping, productId } = await req.json();

    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: getStripeLineItems(cart),
      mode: "payment",
      success_url: `${req.headers.get("origin")}/stripe/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      metadata: { shipping: JSON.stringify(shipping), productId },
    });

    return NextResponse.json({ id: session.id });
  } catch (error: any) {
    console.error("خطأ في إنشاء جلسة الدفع:", error.message);
    return NextResponse.json({ error: error.message || "فشل في إنشاء جلسة الدفع" }, { status: 500 });
  }
}