import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const CREDITS_GRANTED = {
  lifetime: 200,
  credits_50: 50,
  credits_150: 150,
  credits_400: 400,
};

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  console.log('Webhook event:', event.type);

  const base44 = createClientFromRequest(req);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const product = session.metadata?.product;
      const userEmail = session.metadata?.user_email;

      if (!userEmail || !product) {
        console.log('Missing user_email or product in metadata, skipping');
        return Response.json({ received: true });
      }

      // Find the user's profile
      const profiles = await base44.asServiceRole.entities.UserProfile.list();
      const profile = profiles.find(p => p.created_by === userEmail);

      if (!profile) {
        console.log(`No profile found for ${userEmail}`);
        return Response.json({ received: true });
      }

      if (product === 'annual') {
        // Annual subscription — mark premium, no credits
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          is_premium: true,
          premium_type: 'annual',
          premium_since: new Date().toISOString(),
        });
        console.log(`Activated annual premium for ${userEmail}`);

      } else if (product === 'lifetime') {
        // Lifetime — premium forever + 200 credits
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          is_premium: true,
          premium_type: 'lifetime',
          premium_since: new Date().toISOString(),
          ai_credits: (profile.ai_credits || 0) + CREDITS_GRANTED.lifetime,
        });
        console.log(`Activated lifetime premium for ${userEmail} with 200 credits`);

      } else if (CREDITS_GRANTED[product]) {
        // Credit top-up
        const newCredits = (profile.ai_credits || 0) + CREDITS_GRANTED[product];
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          ai_credits: newCredits,
        });
        console.log(`Added ${CREDITS_GRANTED[product]} credits to ${userEmail}, new total: ${newCredits}`);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      // Annual sub cancelled — revoke premium
      const subscription = event.data.object;
      const email = subscription.metadata?.user_email;
      if (email) {
        const profiles = await base44.asServiceRole.entities.UserProfile.list();
        const profile = profiles.find(p => p.created_by === email);
        if (profile && profile.premium_type === 'annual') {
          await base44.asServiceRole.entities.UserProfile.update(profile.id, { is_premium: false });
          console.log(`Revoked annual premium for ${email}`);
        }
      }
    }

  } catch (err) {
    console.error('Error processing webhook:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }

  return Response.json({ received: true });
});