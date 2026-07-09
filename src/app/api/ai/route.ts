import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { type, prompt, options } = await req.json()

  if (!type || !prompt) {
    return NextResponse.json({ error: "Type and prompt are required" }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 })
  }

  const systemMessages: Record<string, string> = {
    bio: "You are a creative bio writer. Generate a short, engaging bio (max 150 characters) based on the user's description. Return only the bio text, no quotes or formatting.",
    link_description: "You are a copywriter. Generate a catchy, clickable description for a link (max 80 characters). Return only the text.",
    page_title: "You are a creative title generator. Generate a short, catchy page title (max 50 characters). Return only the title.",
    color_scheme: "You are a color palette designer. Based on the user's description, suggest a hex color code for an accent color. Return ONLY a hex color like #c04a2b.",
    link_titles: "You are a link title generator. Given a URL and its content description, generate 5 catchy, clickable link titles (max 50 chars each). Return as JSON array of strings only.",
    link_sections: "You are a content organizer. Given a list of link titles and URLs, suggest logical section/group names to categorize them. Return as JSON array of section names only.",
    seo_meta: "You are an SEO expert. Given a page description, generate an SEO-optimized meta title (max 60 chars) and meta description (max 160 chars). Return as JSON: {title, description}.",
    tone_rewrite: "You are a copywriter. Rewrite the given text in the specified tone. Return only the rewritten text.",
    smart_schedule: "You are a scheduling assistant. Given a link description and target audience timezone, suggest optimal start/end dates for maximum engagement. Return as JSON: {startsAt, expiresAt, reasoning}.",
    hashtag_suggestions: "You are a social media expert. Given a link title and description, suggest 10 relevant hashtags. Return as JSON array of strings.",
    email_subject: "You are an email marketer. Generate 5 compelling email subject lines (max 50 chars) for a newsletter about the given topic. Return as JSON array.",
  }

  const systemMessage = systemMessages[type] || systemMessages.bio

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: type === "link_titles" || type === "link_sections" || type === "seo_meta" || type === "smart_schedule" || type === "hashtag_suggestions" || type === "email_subject" ? "gpt-4o-mini" : "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        max_tokens: type === "link_titles" || type === "link_sections" || type === "email_subject" ? 300 : 150,
        temperature: 0.7,
        response_format: ["link_titles", "link_sections", "seo_meta", "smart_schedule", "hashtag_suggestions", "email_subject"].includes(type) ? { type: "json_object" } : undefined,
      }),
    })

    const data = await res.json()
    let text = data.choices?.[0]?.message?.content || ""

    if (["link_titles", "link_sections", "seo_meta", "smart_schedule", "hashtag_suggestions", "email_subject"].includes(type)) {
      try {
        text = JSON.parse(text)
      } catch {
        text = { error: "Failed to parse AI response", raw: text }
      }
    }

    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 })
  }
}
