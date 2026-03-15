import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chat-context";

const client = new Anthropic();

const LOCALE_NAMES: Record<string, string> = {
  en: "English",
  ja: "Japanese",
  de: "German",
};

export async function POST(req: NextRequest) {
  try {
    const { messages, lessonContext, locale } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    // Build system prompt with optional lesson context and locale
    let system = CHAT_SYSTEM_PROMPT;
    if (lessonContext) {
      system += `\n\n## Current lesson context\nThe learner is currently on: ${lessonContext}. Tailor your answers to be relevant to what they are studying right now.`;
    }

    // Language instruction — respond in the learner's selected language
    const lang = LOCALE_NAMES[locale] ?? "English";
    if (locale && locale !== "en") {
      system += `\n\n## Language\nThe learner has selected ${lang} as their language. You MUST respond in ${lang}. Use natural, fluent ${lang} — not machine-translated text. Kanban terminology (WIP, throughput, cycle time, etc.) can remain in English as these are industry-standard terms.`;
    }

    // Map messages to Anthropic format
    const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system,
      messages: anthropicMessages,
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => {
        if (b.type === "text") return b.text;
        return "";
      })
      .join("");

    return NextResponse.json({ message: text });
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    const message = err instanceof Error ? err.message : "Chat request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
