import nodemailer from 'nodemailer';

export async function POST(request) {
  const body = await request.json();
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const toList = [process.env.SMTP_USER].filter(Boolean);
  if (body?.clientEmail) toList.push(body.clientEmail);

  await transporter.sendMail({
    to: toList.join(','),
    from: process.env.SMTP_USER,
    subject: body?.subject || 'New Contact Submission',
    text: JSON.stringify(body, null, 2),
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
