require('dotenv').config();
const express = require('express');
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
});

app.post('/api/contact', async (req, res) => {
  const { name, company, phone, email, message } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Hiányzó kötelező mezők: name, email, message' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Érvénytelen e-mail cím' });
  }

  const to = process.env.CONTACT_TO || 'nerymedkft@gmail.com';
  const from = process.env.CONTACT_FROM || 'noreply@nerymed.hu';

  const companyLine = company ? `\nCég: ${company}` : '';
  const phoneLine = phone ? `\nTelefon: ${phone}` : '';

  try {
    await transport.sendMail({
      from,
      to,
      replyTo: `"${name}" <${email}>`,
      subject: `Kapcsolatfelvételi üzenet – ${name}`,
      text: [
        `Név: ${name}${companyLine}${phoneLine}`,
        `E-mail: ${email}`,
        '',
        message,
      ].join('\n'),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Mail send error:', err);
    res.status(500).json({ error: 'Az üzenet küldése sikertelen' });
  }
});

app.listen(PORT, () => {
  console.log(`Contact server listening on http://localhost:${PORT}`);
});
