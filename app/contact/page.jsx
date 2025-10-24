// app/contact/page.jsx
import { dbConnect } from '@/lib/db';
import Form from '@/models/Form';
import { revalidatePath } from 'next/cache';

async function send(formData) {
  'use server';
  const data = Object.fromEntries(formData);
  const payload = {
    key: 'contact', // <-- tells backend which form config to use
    data,
  };

  await fetch(`${process.env.NEXTAUTH_URL}/api/forms/submit`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  revalidatePath('/contact');
}

export default async function ContactPage() {
  await dbConnect();
  const cfg = await Form.findOne({ key: 'contact' }).lean();

  return (
    <section className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">Contact</h1>

      <form action={send} className="space-y-4">
        {(cfg?.rows || []).map((row, idx) => (
          <div key={idx} className={`grid gap-4 ${row.columns === 2 ? 'grid-cols-2' : ''}`}>
            {(row.fields || []).map((f, i) => (
              <div key={i} className="flex flex-col gap-1">
                <label className="text-sm font-medium">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    name={f.label}
                    placeholder={f.placeholder || ''}
                    className="input border rounded p-2"
                  />
                ) : f.type === 'select' ? (
                  <select
                    name={f.label}
                    className="input border rounded p-2"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      {f.placeholder || 'Please select...'}
                    </option>
                    {(f.options || []).map((o, j) => (
                      <option key={j} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={f.label}
                    type="text"
                    placeholder={f.placeholder || ''}
                    className="input border rounded p-2"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
        <button type="submit" className="button button--primary mt-4">
          Send
        </button>
      </form>
    </section>
  );
}