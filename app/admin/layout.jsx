
import '../globals.css';
export const metadata = { title: 'Admin' };

import { Toaster } from 'react-hot-toast';
export default function AdminLayout({ children }) {
  return (
    <section className="p-6">
      <h1 className="text-2xl mb-4">Admin</h1>
      <nav className="flex gap-3 mb-6">
        <a className="button button--primary" href="/admin">Dashboard</a>
        <a className="button button--secondary" href="/admin/pages">Pages</a>
        <a className="button button--secondary" href="/admin/menus">Menus</a>
        <a className="button button--secondary" href="/admin/news">News</a>
        <a className="button button--secondary" href="/admin/reviews">Reviews</a>
        <a className="button button--secondary" href="/admin/settings">Settings</a>
        <a className="button button--secondary" href="/admin/forms">Forms</a>
        <a className="button button--secondary" href="/admin/submissions">Submissions</a>
              <a className="button button--secondary" href="/admin/users">Users</a>
      </nav>
      {children}
      <Toaster position="top-right" />
    </section>
  );
}
