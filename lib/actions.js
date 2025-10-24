'use server';
import { dbConnect } from '@/lib/db';
import Page from '@/models/Page';
import Menu from '@/models/Menu';
import Review from '@/models/Review';
import Settings from '@/models/Settings';
import News from '@/models/News';
import Category from '@/models/Category';
import Form from '@/models/Form';
import Audit from '@/models/Audit';
import slugify from 'slugify';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import authConfig from '@/lib/authConfig';

async function ensureRole(min='editor'){
  const s = await getServerSession(authConfig);
  if (!s?.user) throw new Error('Not authenticated');
  const allowed = { viewer:0, editor:1, admin:2 };
  if ((allowed[s.user.role||'viewer']||0) < (allowed[min]||1)) {
    throw new Error('Insufficient permissions');
  }
  return s;
}

async function audit(userId, action, entity, entityId, data){
  await Audit.create({ userId, action, entity, entityId, data });
}

const blocksSchema = z.array(z.object({
  type: z.enum(['banner','text-image','parallax','faqs','images-section']),
  data: z.any()
})).default([]);

export async function createOrUpdatePage(prevState, formData){
  await ensureRole('editor');
  await dbConnect();
  const title = z.string().min(1).parse(formData.get('title'));
  const slugRaw = (formData.get('slug')||'').toString();
  const slug = slugRaw || slugify(title, { lower: true, strict: true });
  const blocks = blocksSchema.parse(JSON.parse(formData.get('blocks')||'[]'));
  const doc = await Page.create({ title, slug, blocks });
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'create', 'Page', String(doc._id), { title, slug });
  return { ok: true, slug };
}

export async function deletePage(id){
  await ensureRole('editor');
  await dbConnect();
  const doc = await Page.findByIdAndDelete(id);
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'delete', 'Page', String(id), {});
}

export async function createOrUpdateMenu(prevState, formData){
  await ensureRole('editor');
  await dbConnect();
  const key = z.string().min(1).parse(formData.get('key'));
  let items = [];
  try { items = JSON.parse(formData.get('items') || '[]'); } catch(e){}
  const doc = await Menu.findOneAndUpdate({ key }, { key, items }, { upsert: true, new: true });
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'upsert', 'Menu', String(doc._id), { key });
  return { ok: true };
}

export async function createOrUpdateSettings(prevState, formData){
  await ensureRole('admin');
  await dbConnect();
  const payload = {
    contactNumber: formData.get('contactNumber')?.toString() || '',
    emailAddress: formData.get('emailAddress')?.toString() || '',
    socials: JSON.parse(formData.get('socials') || '{}')
  };
  const one = await Settings.findOne();
  const doc = one ? (await Settings.findByIdAndUpdate(one._id, payload, { new: true })) : (await Settings.create(payload));
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'update', 'Settings', String(doc._id), {});
  return { ok: true };
}

export async function createOrUpdateReview(prevState, formData){
  await ensureRole('editor');
  await dbConnect();
  const title = z.string().min(1).parse(formData.get('title'));
  const text = (formData.get('text')||'').toString();
  const doc = await Review.create({ title, text });
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'create', 'Review', String(doc._id), { title });
  return { ok: true };
}

export async function deleteReview(id){
  await ensureRole('editor');
  await dbConnect();
  await Review.findByIdAndDelete(id);
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'delete', 'Review', String(id), {});
}

export async function upsertCategory(prevState, formData){
  await ensureRole('editor');
  await dbConnect();
  const name = z.string().min(1).parse(formData.get('name'));
  const slug = z.string().min(1).parse(formData.get('slug'));
  const doc = await Category.findOneAndUpdate({ slug }, { name, slug }, { upsert: true, new: true });
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'upsert', 'Category', String(doc._id), { slug });
  return { ok: true };
}

export async function deleteCategory(id){
  await ensureRole('editor');
  await dbConnect();
  await Category.findByIdAndDelete(id);
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'delete', 'Category', String(id), {});
}

export async function createOrUpdateNews(prevState, formData){
  await ensureRole('editor');
  await dbConnect();
  const title = z.string().min(1).parse(formData.get('title'));
  const slugRaw = (formData.get('slug')||'').toString();
  const slug = slugRaw || slugify(title, { lower: true, strict: true });
  const listingImage = (formData.get('listingImage')||'').toString();
  let blocks = []; let categories = [];
  try { blocks = JSON.parse(formData.get('blocks') || '[]'); } catch(e){}
  try { categories = JSON.parse(formData.get('categories') || '[]'); } catch(e){}
  const doc = await News.create({ title, slug, listingImage, blocks, categories });
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'create', 'News', String(doc._id), { slug });
  return { ok: true, slug };
}

export async function deleteNews(id){
  await ensureRole('editor');
  await dbConnect();
  await News.findByIdAndDelete(id);
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'delete', 'News', String(id), {});
}

export async function upsertForm(prevState, formData){
  await ensureRole('editor');
  await dbConnect();
  const key = z.string().min(1).parse(formData.get('key'));
  let rows = [];
  try { rows = JSON.parse(formData.get('rows') || '[]'); } catch(e){}
  const doc = await Form.findOneAndUpdate({ key }, { key, rows }, { upsert: true, new: true });
  const sess = await getServerSession(authConfig);
  await audit(sess.user.id, 'upsert', 'Form', String(doc._id), { key });
  return { ok: true };
}
