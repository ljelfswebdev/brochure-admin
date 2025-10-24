// components/layout/Header.jsx
import { dbConnect } from '@/lib/db';
import Menu from '@/models/Menu';
import Settings from '@/models/Settings';
import HeaderClient from './HeaderClient';

export default async function Header() {
  await dbConnect();

  // Get header menu + global settings (for phone)
  const [headerMenu, settings] = await Promise.all([
    Menu.findOne({ key: 'header' }).lean(),
    Settings.findOne({}).lean(),
  ]);

  const items = Array.isArray(headerMenu?.items) ? headerMenu.items : [];
  const phone =
    settings?.contactNumber ||
    settings?.phone ||
    settings?.contact_number ||
    '';

  return <HeaderClient items={items} phone={phone} />;
}