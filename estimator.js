import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert construction cost estimator.
Provide detailed material and labor estimates in this format:

## Materials
- [Material]: [Quantity] [Unit] @ $[Price/Unit] = $[Total]

## Labor
- [Task]: [Hours] hrs @ $[Rate/hr] = $[Total]

## Total: $[Amount]

Always include safety factor of 10% and explain assumptions.`;

async function estimateProject(description) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Fast and cheap model, great for learning
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: description },
    ],
  });

  console.log(completion.choices[0].message.content);
}

// Test it with construction domain questions
const result = await estimateProject(
  'Build a 15m² wooden deck, 2m above ground, with railing',
);
console.log(result);
