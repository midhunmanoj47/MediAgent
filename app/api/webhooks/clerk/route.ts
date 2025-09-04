import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/config/db'
import { usersTable } from '@/config/schema'

export async function POST(req: Request) {
  console.log('Received Clerk webhook POST');

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const reqHeaders = req.headers;
  const svix_id = reqHeaders.get("svix-id");
  const svix_timestamp = reqHeaders.get("svix-timestamp");
  const svix_signature = reqHeaders.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`)

  // Handle the user.created event
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim();

    if (!id || !email) {
        return new Response('Missing required fields', { status: 400 });
    }

    // If name is empty, use the part of the email before the @
    const finalName = name === '' ? email.split('@')[0] : name;

    await db.insert(usersTable).values({
        id: id,
        email: email,
        name: finalName,
        // credits will use the default value from the schema
    });

    return new Response('User created successfully', { status: 201 });
  }

  return new Response('', { status: 200 })
} 