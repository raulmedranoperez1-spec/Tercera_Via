import { createAgent } from "npm:langchain@1";
import { ChatOpenAI } from "npm:@langchain/openai@1";
import { SYSTEM_PROMPT } from "./prompt.ts";
import { createTavilySearchTool } from "./tavily.ts";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_FREE_MODEL = "openrouter/free";

export async function runAgent(message: string): Promise<string> {
  const openRouterKey = Deno.env.get("OPENROUTER_API_KEY");
  const tavilyKey = Deno.env.get("TAVILY_API_KEY");
  if (!openRouterKey || !tavilyKey) {
    throw new Error("Faltan las claves OPENROUTER_API_KEY o TAVILY_API_KEY");
  }

  const model = new ChatOpenAI({
    model: OPENROUTER_FREE_MODEL,
    apiKey: openRouterKey,
    temperature: 0.2,
    configuration: { baseURL: OPENROUTER_BASE_URL },
  });

  const agent = createAgent({
    model,
    tools: [createTavilySearchTool(tavilyKey)],
    systemPrompt: SYSTEM_PROMPT,
  });

  const result = await agent.invoke({
    messages: [{ role: "user", content: message }],
  });

  const last = result.messages[result.messages.length - 1];
  const content = last?.content;
  if (typeof content !== "string" || content.trim() === "") {
    throw new Error("El agente no devolvió una respuesta de texto");
  }
  return content;
}
