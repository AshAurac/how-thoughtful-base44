import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { event_id, invite_email } = await req.json();
    if (!event_id || !invite_email) {
      return Response.json({ error: 'Missing event_id or invite_email' }, { status: 400 });
    }

    // Fetch the event (owner only)
    const events = await base44.entities.Event.filter({ id: event_id, created_by: user.email });
    const event = events[0];
    if (!event) return Response.json({ error: 'Event not found or access denied' }, { status: 404 });

    // Generate or reuse invite token
    let token = event.invite_token;
    if (!token) {
      token = crypto.randomUUID();
      await base44.entities.Event.update(event_id, { invite_token: token });
    }

    const inviteUrl = `${req.headers.get('origin') || 'https://app.howthoughtful.com'}/join-event/${token}`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: invite_email,
      subject: `${user.full_name} invited you to collaborate on an occasion`,
      body: `
Hi there,

${user.full_name} has invited you to collaborate on "${event.recipient_name}'s ${event.occasion?.replace(/_/g, ' ')}" on How Thoughtful.

You'll be able to view and add gifts together.

Accept the invite here:
${inviteUrl}

— How Thoughtful
      `.trim(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendEventInvite error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});