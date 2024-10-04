import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import axios from "axios";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { type HelpKind, instructions } from "../../lib/ai-instructions";

function claude(instructions: string, text: string) {
  return axios
    .post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: instructions,
        messages: [{ role: "user", content: text }],
      },
      {
        headers: {
          "x-api-key": process.env.CLAUDE_API_KEY ?? "",
          "anthropic-version": "2023-06-01",
        },
      },
    )
    .then((result) => {
      return result.data;
    })
    .catch((error) => {
      console.error(error.toString(), error.response.data);
    });
}

async function image() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? "",
  });
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: "a white siamese cat",
    n: 1,
    size: "1024x1024",
  });
  return response.data[0].url;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const text = req.body.text;
  const method = req.body.method ?? "openai";
  const kind = req.body.kind as HelpKind;

  if (method === "claude") {
    const result = await claude(instructions[kind], text);
    if (!result.content) {
      res.status(200).json({
        text: "No result returned from Claude.",
      });
    }
    res.status(200).json({
      text: result.content[0].text,
    });
  } else if (method === "openai") {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? "",
    });

    const result = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: instructions[kind],
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "gpt-4o-2024-05-13",
    });

    console.log(JSON.stringify(result, null, 2));
    res.status(200).json({
      text: result.choices[0].message.content,
    });
  } else {
    // Access your API key as an environment variable (see "Set up your API key" above)
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY ?? "");

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: instructions[kind] + "\n\nParagraphs:\n\n" + text }],
        },
      ],
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    const response = await result.response;
    const responseText = response.text();
    res.status(200).json({
      text: responseText,
    });
  }
}
