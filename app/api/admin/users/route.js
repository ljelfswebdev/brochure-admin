import User from '@/models/User';
import { json, requireRole } from '../_utils';
import bcrypt from 'bcryptjs';

export async function GET(){
  const gate = await requireRole('admin'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  const items = await User.find().lean();
  return json(items);
}

export async function POST(req){
  const gate = await requireRole('admin'); if (!gate.ok) return json({error:gate.error},{status:gate.status});
  const body = await req.json();
  const email = String(body.email||'').trim();
  const name = String(body.name||'');
  const role = String(body.role||'viewer');
  const password = String(body.password||'');
  if (!email || !password) return json({error:'Email & password required'},{status:400});
  const hash = await bcrypt.hash(password, 10);
  const doc = await User.create({ email, name, role, passwordHash: hash });
  return json(doc);
}
