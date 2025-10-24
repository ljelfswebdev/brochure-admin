// app/api/forms/submit/route.js
import { dbConnect } from '@/lib/db';
import Settings from '@/models/Settings';
import Form from '@/models/Form';
import FormSubmission from '@/models/FormSubmission';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

function normalizeStr(v) {
  return (v == null ? '' : String(v)).trim();
}

function extractEmailAndName(dataObj = {}) {
  let email = '';
  let name = '';

  for (const [labelRaw, valueRaw] of Object.entries(dataObj)) {
    const label = normalizeStr(labelRaw).toLowerCase();
    const value = normalizeStr(valueRaw);

    if (!email && (label.includes('email') || label === 'email')) {
      email = value;
    }
    if (
      !name &&
      (label === 'full name' ||
        label === 'name' ||
        label.includes('full name') ||
        label.includes('name'))
    ) {
      name = value;
    }
  }
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) email = '';
  return { email, name };
}

async function makeTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: Number(SMTP_PORT || 465) === 465,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
}

export async function POST(req) {
  try {
    await dbConnect();

    const payload = await req.json();
    const requestedKey = normalizeStr(payload?.key); // could be key or an _id
    const data = payload?.data && typeof payload.data === 'object' ? payload.data : {};

    if (!requestedKey) {
      return NextResponse.json({ error: 'Missing form key' }, { status: 400 });
    }

    // Accept either { key } or { _id } to be forgiving
    const query = mongoose.isValidObjectId(requestedKey)
      ? { $or: [{ key: requestedKey }, { _id: requestedKey }] }
      : { $or: [{ key: requestedKey }] };

    const form = await Form.findOne(query).lean();
    if (!form) {
      return NextResponse.json({ error: `Form not found for "${requestedKey}"` }, { status: 404 });
    }

    const finalKey = form.key; // always use the canonical key moving forward

    const settings = await Settings.findOne().lean();
    const siteRecipient =
      normalizeStr(settings?.emailAddress) || normalizeStr(process.env.SMTP_USER);

    // Save submission FIRST
    const { email: submitterEmail, name: submitterName } = extractEmailAndName(data);
    const saved = await FormSubmission.create({
      key: finalKey,
      email: submitterEmail || '',
      name: submitterName || '',
      data,
    });

    // Email transport
    const transporter = await makeTransport();

    // Owner mail (subject uses the KEY, not an id)
    let ownerSendError = null;
    if (siteRecipient) {
      const subjectOwner = `New ${finalKey} form submission`;
      const textOwner =
        `You have a new ${finalKey} submission.\n\n` +
        `From: ${submitterName || '(no name)'} <${submitterEmail || '(no email)'}>\n` +
        `Date: ${new Date().toISOString()}\n\n` +
        Object.entries(data)
          .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
          .join('\n');

      try {
        await transporter.sendMail({
          from: process.env.SMTP_USER,          // send FROM your SMTP user for deliverability
          to: siteRecipient,
          subject: subjectOwner,
          text: textOwner,
          replyTo: submitterEmail || undefined, // easy reply path
        });
      } catch (err) {
        ownerSendError = err?.message || String(err);
        console.error('Owner mail error:', ownerSendError);
      }
    }

    // Auto-reply (only if enabled and submitter email exists)
    let autoReplySent = false;
    let autoReplyError = null;

    const ar = form.autoReply || {};
    if (ar.enabled && submitterEmail) {
      const fromEmail = normalizeStr(process.env.SMTP_USER); // always use SMTP user as FROM
      const fromName = normalizeStr(ar.fromName);
      const subject = normalizeStr(ar.subject) || 'Thank you for your message';
      const message = normalizeStr(ar.message) || 'We received your message and will be in touch shortly.';

      try {
        await transporter.sendMail({
          from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
          to: submitterEmail,
          subject,
          text: message,
        });
        autoReplySent = true;
      } catch (err) {
        autoReplyError = err?.message || String(err);
        console.error('Auto-reply error:', autoReplyError);
      }
    }

    return NextResponse.json({
      ok: true,
      id: saved._id,
      saved: {
        key: saved.key,
        email: saved.email,
        name: saved.name,
        createdAt: saved.createdAt,
      },
      mail: {
        ownerError: ownerSendError,
        autoReplySent,
        autoReplyError,
      },
    });
  } catch (err) {
    console.error('Form submit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}