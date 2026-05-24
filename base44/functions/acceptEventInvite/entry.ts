import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { token } = await req.json();
    if (!token) return Response.json({ error: 'Missing token' }, { status: 400 });

    // Find the event with this invite token
    const events = await base44.asServiceRole.entities.Event.filter({ invite_token: token });
    const event = events[0];
    if (!event) return Response.json({ error: 'Invalid or expired invite link' }, { status: 404 });

    // Don't add the owner as collaborator
    if (event.created_by === user.email) {
      return Response.json({ event_id: event.id, already_owner: true });
    }

    // Add to collaborators if not already there
    const existing = event.collaborator_emails || [];
    if (!existing.includes(user.email)) {
      await base44.asServiceRole.entities.Event.update(event.id, {
        collaborator_emails: [...existing, user.email],
      });
    }

    return Response.json({ event_id: event.id, success: true });
  } catch (error) {
    console.error('acceptEventInvite error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});