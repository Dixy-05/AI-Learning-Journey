import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askGPT(question) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Fast and cheap model, great for learning
    max_tokens: 1024,
    messages: [{ role: 'user', content: question }],
  });

  console.log(completion.choices[0].message.content);
}

// Test it with construction domain questions
askGPT('Estimate materials for a 100m² concrete slab, 10cm thick');
