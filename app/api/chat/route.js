import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";


const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

const buildGoogleGenAIPrompt = (messages) => {
    return messages
      .filter((message) => message.role === "user" || message.role === "ai")
      .map((message) => `${message.role === "user" ? "user" : "ai"}: ${message.content}`)
      .join("\n");
  };
  


export async function POST(req) {
  const { messages, selectedOption } = await req.json();

  let model;
  switch (selectedOption) {
    case "gemini-1.5-pro-latest":
      model = google("gemini-1.5-pro-latest");
      break;
    case "gemini-1.5-pro":
      model = google("gemini-1.5-pro");
      break;
    case "gemini-1.5-flash":
      model = google("gemini-1.5-flash");
      break;
    case "gemini-1.0-pro":
      model = google("gemini-1.0-pro");
      break;
    default:
      model = google("gemini-1.5-pro-latest");
      break;
  }


  const prompt = buildGoogleGenAIPrompt(messages);

  
  try {
    const text = await streamText({
      model,
      prompt,
      instruction:"Generate text without using *"
    });

    return text.toDataStreamResponse();
  } catch (error) {
    console.error("Error generating text stream:", error);
    return new Response(JSON.stringify({ error: "AI response generation failed." }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
