import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
console.log('process.env.ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY);

async function askClaude(question) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: question }],
  });

  console.log(message.content[0].text);
}

// Test it with construction domain questions
askClaude('Estimate materials for a 100m² concrete slab, 10cm thick');
