const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('dist'));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NOTIFY_EMAIL || '00vince00@gmail.com',
    pass: process.env.NOTIFY_APP_PASSWORD || 'qmhl nrhz aznt ooow',
  },
});

app.post('/notify', async (req, res) => {
  const { taskName } = req.body;
  try {
    await transporter.sendMail({
      from: '00vince00@gmail.com',
      to: '9173853869@msg.fi.google.com',
      subject: 'Task started',
      text: `WIP: ${taskName}`,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('SMS notify failed:', err);
    res.status(500).json({ ok: false });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});