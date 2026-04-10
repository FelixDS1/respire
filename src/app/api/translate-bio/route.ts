import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { text, targetLang } = await req.json()

  if (!text?.trim() || !targetLang) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'No API key configured' }, { status: 500 })
  }

  const targetName = targetLang === 'fr' ? 'French' : 'English'

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Translate the following therapist biography to ${targetName}. Preserve the personal, warm, professional tone. Return only the translated text — no commentary, no quotes.\n\n${text}`,
      }],
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }

  const data = await response.json()
  const translated = data.content?.[0]?.text ?? ''

  return NextResponse.json({ translated })
}
