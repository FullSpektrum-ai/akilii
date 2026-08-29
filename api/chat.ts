import type { VercelRequest, VercelResponse } from "@vercel/node";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: "OPENAI_API_KEY is not configured" });
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const upstream = await fetch("https://api.openai.com/v1/chat/completions", { method:"POST", headers:{ "Content-Type":"application/json", Authorization:"Bearer "+key }, body:JSON.stringify({ model:process.env.OPENAI_MODEL||"gpt-4o-mini", messages, stream:false }) });
  const data = await upstream.json();
  if (!upstream.ok) return res.status(upstream.status).json({ error:data?.error?.message||"OpenAI request failed" });
  return res.status(200).json({ text:data.choices?.[0]?.message?.content||"" });
}
