import Credentials from 'next-auth/providers/credentials';
import User from '@/models/User';
import { dbConnect } from '@/lib/db';

const config = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
      async authorize(creds) {
        await dbConnect();
        const user = await User.findOne({ email: creds.email });
        if (!user) return null;
        const ok = await user.verifyPassword(creds.password);
        if (!ok) return null;
        return { id: String(user._id), name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) token.role = user.role; return token; },
    async session({ session, token }) { session.user.role = token.role; return session; }
  }
};
export default config;
