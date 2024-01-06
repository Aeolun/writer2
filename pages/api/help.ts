// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from 'openai'

const instructions = {
  next_paragraph: 'You are a writing assistant. When prompted with a set of paragraphs, you will output a suggestion for the next paragraph of the story. There is no need to leave the paragraph open ended or make it needlessly positive in an otherwise grim situation. This is for a novel, do not rush the story along. There is time to describe things and reflect for the characters.',
  critique: "You are a writing assistant, try to give constructive advice. When prompted with a set of paragraphs, you will output a concerns you might have about the writing. This could be anything from grammar to plot holes to character inconsistencies.",
  synopsis: "You are a writing assistant, try to give constructive advice. When prompted with a set of paragraphs, you will output a summary of the given paragraphs.",
  critiqueStoryline: "You are a writing assistant, try to give constructive advice. When prompted with a book summary, arc summary, and a set of chapter summaries, you will output a list of possible concerns with the storyline. If they exist, focus specifically on inconsistencies and or plot holes. Try to provide ways the issues could be resolved or mitigated.",
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const text = req.body.text;
  const kind = req.body.kind as keyof typeof instructions

  const openai = new OpenAI(process.env.OPENAI_API_KEY);

  const result = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: instructions[kind]
      },
      {
        role: 'user',
        content: text
      }
    ],
    model: 'gpt-4-1106-preview'
  })

  console.log(JSON.stringify(result, null, 2))
  res.status(200).json({
    text: result.choices[0].message.content
  });
}
