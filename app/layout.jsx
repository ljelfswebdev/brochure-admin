import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = { title: 'Brochure App' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
