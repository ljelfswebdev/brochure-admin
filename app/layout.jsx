import './globals.css';
import Header from '@/components/layout/Header';   // 👈 THIS ONE
import Footer from '@/components/Footer';

export const metadata = { title: 'Brochure App' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />  {/* ✅ this automatically uses HeaderClient inside */}
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}