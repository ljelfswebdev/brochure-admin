// app/api/admin/settings/route.js
import Settings from '@/models/Settings';
import { json, requireRole } from '../_utils';

export async function GET() {
  const gate = await requireRole('editor');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });
  const doc = await Settings.findOne().lean();
  return json(doc || {});
}

export async function POST(req) {
  // 🔒 admin-only (change to 'editor' if you want editors to save settings)
  const gate = await requireRole('admin');
  if (!gate.ok) return json({ error: gate.error }, { status: gate.status });

  const body = await req.json();
  const payload = {
    contactNumber: String(body.contactNumber || ''),
    emailAddress: String(body.emailAddress || ''),
    socials: body.socials && typeof body.socials === 'object' ? body.socials : {},
    homepageSlug: body.homepageSlug ? String(body.homepageSlug) : '',
  };

  const old = await Settings.findOne();
  const doc = old
    ? await Settings.findByIdAndUpdate(old._id, payload, { new: true })
    : await Settings.create(payload);

  return json(doc);
}