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

    // Get all users, events, and profiles using service role (no admin user required)
    const allUsers = await base44.asServiceRole.entities.User.list();
    const allEvents = await base44.asServiceRole.entities.Event.list();
    const allProfiles = await base44.asServiceRole.entities.UserProfile.list();

    // Build a map of email -> timezone
    const timezoneMap = {};
    for (const profile of allProfiles) {
      if (profile.created_by && profile.timezone) {
        timezoneMap[profile.created_by] = profile.timezone;
      }
    }

    let sent = 0;
    let skipped = 0;

    for (const event of allEvents) {
      if (!event.event_date) { skipped++; continue; }

      // Get "today" in the user's local timezone
      const userTimezone = timezoneMap[event.created_by] || 'UTC';
      const localToday = new Date(new Date().toLocaleString('en-US', { timeZone: userTimezone }));
      localToday.setHours(0, 0, 0, 0);

      const eventDate = new Date(event.event_date);
      eventDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.round((eventDate - localToday) / (1000 * 60 * 60 * 24));

      if (!REMINDER_DAYS.includes(daysUntil)) { skipped++; continue; }

      // Find the owner of this event
      const owner = allUsers.find(u => u.email === event.created_by);
      if (!owner?.email) { skipped++; continue; }

      // Check if we already sent this reminder
      const reminderKey = `${daysUntil}d`;
      if (event.reminders_sent?.includes(reminderKey)) { skipped++; continue; }

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

      console.log(`Sent ${reminderKey} reminder for event ${event.id} to ${owner.email}`);
      sent++;
    }

    return Response.json({ success: true, sent, skipped });
  } catch (error) {
    console.error('sendEventReminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});