import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import dotenv from 'dotenv';
import { db } from '../db/sqlite.js';

dotenv.config();

function detectPlatform(from, subject, body){
  const s = `${from} ${subject} ${body}`.toLowerCase();
  if(s.includes('zomato')) return 'Zomato';
  if(s.includes('swiggy')) return 'Swiggy';
  if(s.includes('domino')) return 'Dominos';
  if(s.includes('haldiram')) return 'Haldiram';
  if(s.includes('pizza hut') || s.includes('pizzahut')) return 'Pizza Hut';
  return 'Unknown';
}

function extractOrder(body){
  const orderIdMatch = body.match(/order\s*id[:#]?\s*([A-Z0-9-]+)/i);
  const totalMatch = body.match(/total\s*[:₹$]\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
  const phoneMatch = body.match(/(\+?91[ -]?)?[6-9][0-9]{9}/);
  const nameMatch = body.match(/customer[:\s]*([A-Za-z ]{3,})/i);

  return {
    order_id: orderIdMatch?.[1] || null,
    total: totalMatch ? parseFloat(totalMatch[1]) : null,
    customer_phone: phoneMatch?.[0] || null,
    customer_name: nameMatch?.[1]?.trim() || null
  };
}

export async function fetchAndParseEmails(){
  const client = new ImapFlow({
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT || 993),
    secure: String(process.env.IMAP_SECURE || 'true') === 'true',
    auth: { user: process.env.IMAP_USER, pass: process.env.IMAP_PASS }
  });

  await client.connect();
  let lock = await client.getMailboxLock('INBOX');
  let count = 0;
  try{
    const fetchCriteria = String(process.env.FETCH_UNREAD_ONLY || 'true') === 'true' ? ['UNSEEN'] : ['ALL'];
    for await (let msg of client.fetch(fetchCriteria, {source: true, envelope: true, uid: true})) {
      const parsed = await simpleParser(msg.source);
      const from = parsed.from?.text || '';
      const subject = parsed.subject || '';
      const body = (parsed.text || '') + '\n' + (parsed.html || '');
      const platform = detectPlatform(from, subject, body);
      const basic = extractOrder(parsed.text || '');

      const toAddr = (parsed.to?.value?.[0]?.address || '').toLowerCase();
      const vendor = db.prepare('SELECT id FROM vendors WHERE email = ?').get(toAddr);

      const items = [];

      db.prepare(`
        INSERT INTO orders (vendor_id, platform, order_id, customer_name, customer_phone, address, items, total_amount, status, source_email_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?)
      `).run(
        vendor?.id || null,
        platform,
        basic.order_id,
        basic.customer_name,
        basic.customer_phone,
        null,
        JSON.stringify(items),
        basic.total,
        String(msg.uid)
      );

      await client.messageFlagsAdd({uid: msg.uid}, ['\\Seen']);
      count++;
    }
  } finally {
    lock.release();
    await client.logout();
  }
  return {ingested: count};
}
