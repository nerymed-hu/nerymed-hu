require('dotenv').config({ quiet: true });
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:4321',
  methods: ['POST'],
}));

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: Number(process.env.SMTP_PORT) || 25,
  secure: false,
  tls: { rejectUnauthorized: false },
});

// Returns true (divert to test address), false (no test header: normal delivery) or
// null (test header sent but test mode is off or token wrong: must not reach the live inbox).
function testRequestState(req) {
  const given = req.get('x-test-token');
  if (!given) return false;
  const { CONTACT_TEST_TO, CONTACT_TEST_TOKEN } = process.env;
  if (!CONTACT_TEST_TO || !CONTACT_TEST_TOKEN) return null;
  const a = Buffer.from(given);
  const b = Buffer.from(CONTACT_TEST_TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? true : null;
}

app.post('/api/contact', async (req, res) => {
  const { name, company, phone, email, message, source } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Hiányzó kötelező mezők: name, email, message' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Érvénytelen e-mail cím' });
  }

  // haziorvos rendelő routes to the practice inbox
  // A request carrying the secret X-Test-Token header is diverted to CONTACT_TEST_TO.
  // Disabled unless both CONTACT_TEST_TO and CONTACT_TEST_TOKEN are set. A request that sends
  // the header while test mode is off or the token is wrong gets 403, never the live inbox.
  const testMode = testRequestState(req);
  if (testMode === null) {
    console.warn('Contact rejected: invalid or unconfigured test token');
    return res.status(403).json({ error: 'Érvénytelen teszt token' });
  }
  const to = testMode
    ? process.env.CONTACT_TEST_TO
    : source === 'haziorvos'
      ? (process.env.CONTACT_TO_HAZIRVOS || 'nerymedkft@gmail.com')
      : (process.env.CONTACT_TO || 'dr.nery.klaudia@nerymed.hu');
  const from = process.env.CONTACT_FROM || 'noreply@nerymed.hu';

  const companyLine = company ? `\nCég: ${company}` : '';
  const phoneLine = phone ? `\nTelefon: ${phone}` : '';

  try {
    await transport.sendMail({
      from,
      to,
      replyTo: `"${name}" <${email}>`,
      subject: `${testMode ? '[TEST] ' : ''}Kapcsolatfelvételi üzenet – ${name}`,
      text: [
        `Név: ${name}${companyLine}${phoneLine}`,
        `E-mail: ${email}`,
        '',
        message,
      ].join('\n'),
    });

    console.log(`Contact mail sent to=${to} source=${source || 'default'}${testMode ? ' (test)' : ''}`);
    res.json({ ok: true });
  } catch (err) {
    console.error('Mail send error:', err);
    res.status(500).json({ error: 'Az üzenet küldése sikertelen' });
  }
});

app.listen(PORT, () => {
  console.log(`Contact server listening on http://localhost:${PORT}`);
  console.log(`Test mode: ${process.env.CONTACT_TEST_TO && process.env.CONTACT_TEST_TOKEN ? 'enabled' : 'disabled'}`);
});
