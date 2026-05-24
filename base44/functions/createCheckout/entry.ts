import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const PRICE_IDS = {
  annual: 'price_1TaZ7nKIqRNPN7gqUBqUxH63',
  lifetime: 'price_1TaZ7nKIqRNPN7gq3XPX7mHs',
  credits_50: 'price_1TaExEKIqRNPN7gq3PvrmkyV',
  credits_150: 'price_1TaExEKIqRNPN7gqcL6XHSxf',
  credits_400: 'price_1TaExEKIqRNPN7gqp1UpMuBc',
};

const CREDITS_GRANTED = {
  lifetime: 200,
  credits_50: 50,
  credits_150: 150,
  credits_400: 400,
};

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const base44 = createClientFromRequest(req);
    const { product, user_email, success_url, cancel_url } = await req.json();

    if (!PRICE_IDS[product]) {
      return Response.json({ error: 'Invalid product' }, { status: 400 });
    }

    const priceId = PRICE_IDS[product];
    const isSubscription = product === 'annual';

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: success_url || `${req.headers.get('origin')}/upgrade?success=true&product=${product}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/upgrade`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        product,
        user_email: user_email || '',
      },
    };

    if (user_email) {
      sessionParams.customer_email = user_email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`Checkout session created: ${session.id} for product: ${product}, user: ${user_email}`);
    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});