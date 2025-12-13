import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================================================
// EXAMPLE 1: ROLE PROMPTING ONLY
// ============================================================================
async function example1_rolePrompting() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 1: ROLE PROMPTING ONLY');
  console.log('='.repeat(80));
  console.log('Using system prompt to define the AI\'s role\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: 'You are a seasoned construction cost estimator with 20 years of experience in Honduras.', // <-- ROLE PROMPT
    messages: [
      {
        role: 'user',
        content: 'What is the average cost per square meter for building a concrete foundation in Honduras?',
      },
    ],
  });

  console.log('Response:');
  console.log(response.content[0].text);
}

// ============================================================================
// EXAMPLE 2: PREFILL ONLY
// ============================================================================
async function example2_prefill() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 2: PREFILL ONLY');
  console.log('='.repeat(80));
  console.log('Using assistant prefill to guide the response direction\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    // No system prompt this time
    messages: [
      {
        role: 'user',
        content: 'What is your opinion on using rebar vs fiber reinforcement in concrete slabs?',
      },
      {
        role: 'assistant',
        content: 'Based on structural engineering principles, I recommend', // <-- PREFILL
      },
    ],
  });

  console.log('Prefill used: "Based on structural engineering principles, I recommend"');
  console.log('\nResponse (continues from prefill):');
  console.log('Based on structural engineering principles, I recommend' + response.content[0].text);
}

// ============================================================================
// EXAMPLE 3: ROLE + PREFILL COMBINED
// ============================================================================
async function example3_roleAndPrefill() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 3: ROLE + PREFILL COMBINED');
  console.log('='.repeat(80));
  console.log('Combining system prompt (role) with assistant prefill\n');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: 'You are a safety inspector with expertise in construction site regulations in Central America.', // <-- ROLE
    messages: [
      {
        role: 'user',
        content: 'Inspect this construction site scenario: Workers are mixing concrete without proper PPE, scaffolding has no guardrails, and electrical cables are exposed near water.',
      },
      {
        role: 'assistant',
        content: 'SAFETY VIOLATION REPORT\n\nCritical Issues Identified:', // <-- PREFILL
      },
    ],
  });

  console.log('System Role: Safety inspector with Central America expertise');
  console.log('Prefill: "SAFETY VIOLATION REPORT\\n\\nCritical Issues Identified:"');
  console.log('\nResponse:');
  console.log('SAFETY VIOLATION REPORT\n\nCritical Issues Identified:' + response.content[0].text);
}

// ============================================================================
// EXAMPLE 4: ROLE + PREFILL + JSON OUTPUT
// ============================================================================
async function example4_allTogether() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 4: ROLE + PREFILL + JSON OUTPUT');
  console.log('='.repeat(80));
  console.log('Combining all three techniques for structured JSON response\n');

  const SYSTEM_PROMPT = `You are an expert civil engineer specializing in risk assessment for construction projects in Honduras.

IMPORTANT: You must respond ONLY with valid JSON in this exact format:
{
  "projectName": "string",
  "riskLevel": "low" | "medium" | "high" | "critical",
  "risks": [
    {
      "category": "string",
      "description": "string",
      "severity": 1-10,
      "mitigation": "string"
    }
  ],
  "estimatedDelay": "string",
  "budgetImpact": "string",
  "recommendations": ["string"]
}

Do not include any text outside the JSON structure.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT, // <-- ROLE + JSON FORMAT INSTRUCTIONS
    messages: [
      {
        role: 'user',
        content: `Assess the risks for this project: Building a 3-story apartment complex in Tegucigalpa during rainy season. Budget: $500K. Timeline: 8 months. Soil tests show high clay content.`,
      },
      {
        role: 'assistant',
        content: '{', // <-- PREFILL to force JSON output
      },
    ],
  });

  console.log('System Role: Civil engineer + JSON format requirements');
  console.log('Prefill: "{"');
  console.log('\nJSON Response:');

  // Parse and pretty-print the JSON
  const jsonResponse = '{' + response.content[0].text;
  try {
    const parsed = JSON.parse(jsonResponse);
    console.log(JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.log('Raw response (failed to parse JSON):');
    console.log(jsonResponse);
  }
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================
async function runAllExamples() {
  console.log('\n🎓 PROMPT ENGINEERING EXAMPLES');
  console.log('Learning: Role Prompting + Prefill + JSON Output\n');

  try {
    // Run each example sequentially
    await example1_rolePrompting();

    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause between calls
    await example2_prefill();

    await new Promise(resolve => setTimeout(resolve, 1000));
    await example3_roleAndPrefill();

    await new Promise(resolve => setTimeout(resolve, 1000));
    await example4_allTogether();

    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL EXAMPLES COMPLETED');
    console.log('='.repeat(80));
    console.log('\nKey Takeaways:');
    console.log('1. System prompt = Define the AI\'s role and expertise');
    console.log('2. Prefill = Start the response to guide format/tone');
    console.log('3. Combine both = Maximum control over output');
    console.log('4. JSON prefill with "{" = Reliable structured output');
    console.log('\n');

  } catch (error) {
    console.error('Error running examples:', error.message);
    if (error.status === 400) {
      console.error('\n⚠️  Check your Anthropic API credits at: https://console.anthropic.com/settings/billing');
    }
  }
}

// Run all examples
runAllExamples();
