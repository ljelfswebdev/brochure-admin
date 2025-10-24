import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import authConfig from '@/lib/authConfig';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export default async function Users(){
  await dbConnect();
  const sess = await getServerSession(authConfig);
  if (sess?.user?.role !== 'admin') {
    return <div>Admins only.</div>;
  }
  const users = await User.find().lean();

  async function createUser(formData){ 'use server';
    const email = z.string().email().parse(formData.get('email'));
    const name = (formData.get('name')||'').toString();
    const role = (formData.get('role')||'viewer').toString();
    const password = z.string().min(6).parse(formData.get('password'));
    await dbConnect();
    const hash = await bcrypt.hash(password, 10);
    await User.create({ email, name, role, passwordHash: hash });
  }

  async function updateRole(formData){ 'use server';
    const id = formData.get('id');
    const role = formData.get('role');
    await dbConnect();
    await User.findByIdAndUpdate(id, { role });
  }

  return (
    <div>
      <h2 className="text-xl mb-2">Users</h2>
      <form action={createUser}>
        <div><label>Name</label><input name="name" /></div>
        <div><label>Email</label><input name="email" required type="email" /></div>
        <div><label>Password</label><input name="password" required type="password" /></div>
        <div><label>Role</label>
          <select name="role" defaultValue="editor"><option>viewer</option><option>editor</option><option>admin</option></select>
        </div>
        <button className="button button--primary">Create User</button>
      </form>

      <hr className="my-6" />

      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Change</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
              <td>
                <form action={updateRole}>
                  <input type="hidden" name="id" value={String(u._id)} />
                  <select name="role" defaultValue={u.role}><option>viewer</option><option>editor</option><option>admin</option></select>
                  <button className="button button--secondary" style={{marginLeft:6}}>Update</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
