import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REMINDER_DAYS = [30, 14, 3];

const REMINDER_TEMPLATES = {
  30: {
    subject: (name, occasion) => `🛒 30 days until ${name}'s ${occasion} — time to buy online`,
    body: (name, occasion, date, budget) => `Hey!

Just a heads-up: ${name}'s ${occasion} is in 30 days (${date}).

This is the perfect time to order online so gifts arrive with time to spare.

${budget ? `Budget: $${budget}` : ''}

Head to How Thoughtful to plan your gift 🎁

— How Thoughtful`,
  },
  14: {
    subject: (name, occasion) => `🏪 14 days until ${name}'s ${occasion} — last chance for in-store`,
    body: (name, occasion, date, budget) => `Hey!

${name}'s ${occasion} is in 14 days (${date}).

If you haven't ordered online yet, now's a great time to pick something up in store.

${budget ? `Budget: $${budget}` : ''}

Open How Thoughtful to check your gift plan 🎁

— How Thoughtful`,
  },
  3: {
    subject: (name, occasion) => `🎀 3 days until ${name}'s ${occasion} — time to wrap & prepare`,
    body: (name, occasion, date) => `Hey!

${name}'s ${occasion} is in just 3 days (${date})!

Time to wrap gifts, write the card, and get everything ready.

Open How Thoughtful to check off your prep checklist ✅

— How Thoughtful`,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list();
    // Get all events
    const allEvents = await base44.asServiceRole.entities.Event.list();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sent = 0;
    let skipped = 0;

    for (const event of allEvents) {
      if (!event.event_date) continue;

      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.round((eventDate - today) / (1000 * 60 * 60 * 24));

      if (!REMINDER_DAYS.includes(daysUntil)) {
        skipped++;
        continue;
      }

      // Find the owner of this event
      const owner = allUsers.find(u => u.email === event.created_by);
      if (!owner?.email) {
        skipped++;
        continue;
      }

      // Check if we already sent this reminder
      const reminderKey = `${daysUntil}d`;
      if (event.reminders_sent?.includes(reminderKey)) {
        skipped++;
        continue;
      }

      const template = REMINDER_TEMPLATES[daysUntil];
      const occasion = (event.occasion || 'occasion').replace(/_/g, ' ');
      const formattedDate = new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        timeZone: 'UTC'
      });

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: owner.email,
        subject: template.subject(event.recipient_name, occasion),
        body: template.body(event.recipient_name, occasion, formattedDate, event.budget),
      });

      // Mark reminder as sent
      const updatedReminders = [...(event.reminders_sent || []), reminderKey];
      await base44.asServiceRole.entities.Event.update(event.id, {
        reminders_sent: updatedReminders,
      });

      sent++;
    }

    return Response.json({ success: true, sent, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});