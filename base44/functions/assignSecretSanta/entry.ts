import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { listId } = await req.json();

    if (!listId) {
      return Response.json({ error: 'listId required' }, { status: 400 });
    }

    // Fetch the list
    const lists = await base44.asServiceRole.entities.SharedList.filter({ id: listId });
    const list = lists[0];
    if (!list) {
      return Response.json({ error: 'List not found' }, { status: 404 });
    }

    const members = list.members || [];
    if (members.length < 2) {
      return Response.json({ error: 'Need at least 2 participants' }, { status: 400 });
    }

    // Shuffle and assign — nobody gets themselves
    let givers = [...members];
    let receivers = [...members];

    // Fisher-Yates shuffle
    for (let i = receivers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }

    // Ensure nobody is assigned to themselves (re-shuffle if needed, max 10 attempts)
    let attempts = 0;
    while (givers.some((g, i) => g.email === receivers[i].email) && attempts < 10) {
      for (let i = receivers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
      }
      attempts++;
    }

    // Send secret emails
    const emailPromises = givers.map((giver, i) => {
      const receiver = receivers[i];
      return base44.asServiceRole.integrations.Core.SendEmail({
        to: giver.email,
        subject: `🎅 Your Secret Santa match for ${list.title}`,
        body: `Hey ${giver.name}!

The Secret Santa draw has been done — and here's your secret:

🎁 You are buying a gift for: **${receiver.name}**

Keep it between us! Nobody else knows your match.

Some ideas to help:
- Check the shared gift list for inspiration: ${Deno.env.get('VITE_APP_URL') || 'https://howthoughtful.app'}/group/${list.share_token}
- Think about what ${receiver.name} would genuinely love and use
- A thoughtful personal touch always goes a long way 💛

Happy gifting,
The How Thoughtful team`
      });
    });

    await Promise.all(emailPromises);

    // Mark as assigned
    await base44.asServiceRole.entities.SharedList.update(listId, { santa_assigned: true });

    console.log(`Secret Santa assigned for list ${listId}, ${members.length} participants emailed`);
    return Response.json({ success: true, count: members.length });

  } catch (error) {
    console.error('assignSecretSanta error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});