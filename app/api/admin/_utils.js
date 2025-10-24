import { getServerSession } from 'next-auth';
import authConfig from '@/lib/authConfig';
import { dbConnect } from '@/lib/db';

export async function requireRole(role='editor'){
  const session = await getServerSession(authConfig);
  if (!session?.user) return { ok:false, status:401, error:'Unauthorized' };
  const levels = { viewer:0, editor:1, admin:2 };
  const userLevel = levels[session.user.role] ?? 0;
  const need = levels[role] ?? 1;
  if (userLevel < need) return { ok:false, status:403, error:'Forbidden' };
  await dbConnect();
  return { ok:true, session };
}

export function json(data, init={}){
  return new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: { 'content-type':'application/json', ...(init.headers||{}) }
  });
}
