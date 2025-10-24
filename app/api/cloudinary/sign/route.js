import crypto from 'crypto';

export async function GET(req){
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const ts = Math.floor(Date.now()/1000);
  const toSign = [`timestamp=${ts}`];
  if (params.folder) toSign.push(`folder=${params.folder}`);
  const signature = crypto
    .createHash('sha1')
    .update(toSign.sort().join('&') + process.env.CLOUDINARY_API_SECRET)
    .digest('hex');
  return Response.json({
    timestamp: ts,
    apiKey: process.env.CLOUDINARY_API_KEY,
    signature
  });
}
