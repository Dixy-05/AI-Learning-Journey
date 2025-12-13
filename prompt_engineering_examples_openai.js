import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/*
 * IMPORTANT NOTE: OpenAI vs Anthropic Differences
 *
 * PREFILLING:
 * - Anthropic: ✅ Supports prefilling (assistant message auto-continues)
 * - OpenAI: ❌ Does NOT support prefilling
 *
 * ALTERNATIVE FOR OPENAI:
 * - Use FEW-SHOT LEARNING (provide example user/assistant pairs)
 *
 * JSON OUTPUT:
 * - Anthropic: Use prefill with "{"
 * - OpenAI: Use response_format parameter (json_object or json_schema)
 *
 * Official Docs:
 * - https://platform.openai.com/docs/guides/chat-completions
 * - https://platform.openai.com/docs/guides/structured-outputs
 */

// ============================================================================
// EXAMPLE 1: ROLE PROMPTING ONLY
// ============================================================================
async function example1_rolePrompting() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 1: ROLE PROMPTING ONLY');
  console.log('='.repeat(80));
  console.log("Using system message to define the AI's role\n");

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages: [
      {
        role: 'system', // <-- ROLE PROMPT
        content:
          'You are a seasoned construction cost estimator with 20 years of experience in Honduras.',
      },
      {
        role: 'user',
        content:
          'What is the average cost per square meter for building a concrete foundation in Honduras?',
      },
    ],
  });

  console.log('System Role: Construction cost estimator');
  console.log('\nResponse:');
  console.log(response.choices[0].message.content);
}

// ============================================================================
// EXAMPLE 2: FEW-SHOT LEARNING (OpenAI's Alternative to Prefilling)
// ============================================================================
async function example2_fewShotLearning() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 2: FEW-SHOT LEARNING');
  console.log('='.repeat(80));
  console.log('Teaching the AI a specific format through examples\n');
  console.log('⚠️  Note: OpenAI does NOT support prefilling like Anthropic.');
  console.log('Instead, use few-shot learning (example conversations)\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages: [
      // EXAMPLE 1: Show desired format
      {
        role: 'user',
        content: 'What material is best for roof framing?',
      },
      {
        role: 'assistant',
        content:
          '✓ RECOMMENDATION: Steel trusses\n✗ NOT RECOMMENDED: Wood beams\nREASON: Steel provides better durability in humid climates.',
      },
      // EXAMPLE 2: Reinforce the pattern
      {
        role: 'user',
        content: 'Should I use concrete blocks or bricks?',
      },
      {
        role: 'assistant',
        content:
          '✓ RECOMMENDATION: Concrete blocks\n✗ NOT RECOMMENDED: Clay bricks\nREASON: Concrete blocks are more cost-effective and faster to install.',
      },
      // ACTUAL QUESTION: AI learns from above examples
      {
        role: 'user',
        content:
          'What is your opinion on using rebar vs fiber reinforcement in concrete slabs?',
      },
    ],
  });

  console.log('Technique: Provided 2 example Q&A pairs to teach format');
  console.log('\nResponse (should follow the ✓/✗ format):');
  console.log(response.choices[0].message.content);
}

// ============================================================================
// EXAMPLE 3: ROLE + FEW-SHOT COMBINED
// ============================================================================
async function example3_roleAndFewShot() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 3: ROLE + FEW-SHOT COMBINED');
  console.log('='.repeat(80));
  console.log('Combining system role with example-based learning\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1024,
    messages: [
      {
        role: 'system', // <-- ROLE
        content:
          'You are a safety inspector with expertise in construction site regulations in Central America.',
      },
      // FEW-SHOT EXAMPLE: Show report format
      {
        role: 'user',
        content: 'Inspect: Workers not wearing hard hats, ladder unstable.',
      },
      {
        role: 'assistant',
        content: `🚨 SAFETY VIOLATION REPORT

Critical Issues:
1. [HIGH] Missing PPE - Hard hats required
2. [MEDIUM] Unstable ladder - Fall hazard

Required Actions:
- Stop work immediately
- Provide PPE to all workers
- Replace ladder before continuing`,
      },
      {
        role: 'user',
        content:
          'Inspect: Workers not wearing gloves. Not wearing harness on height.',
      },
      {
        role: 'assistant',
        content: `
Critical Issues:
1. [HIGH] Missing PPE - Harness required while working at height
2. [MEDIUM] Missing Gloves - Hand protection needed

Required Actions:
- Stop work immediately
- Provide PPE to all workers
- Enforce harness use at heights before continuing`,
      },
      // ACTUAL INSPECTION REQUEST
      {
        role: 'user',
        content:
          'Inspect this construction site: Workers are mixing concrete without proper PPE, scaffolding has no guardrails, and electrical cables are exposed near water.',
      },
    ],
  });

  console.log('System Role: Safety inspector');
  console.log('Few-shot: 1 example inspection report');
  console.log('\nResponse (should follow report format):');
  console.log(response.choices[0].message.content);
}

// ============================================================================
// EXAMPLE 4: JSON OBJECT MODE (Basic)
// ============================================================================
async function example4_jsonObjectMode() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 4: JSON OBJECT MODE (Basic)');
  console.log('='.repeat(80));
  console.log('Using response_format: { type: "json_object" }\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 2048,
    response_format: { type: 'json_object' }, // <-- Guarantees valid JSON
    messages: [
      {
        role: 'system',
        content: `You are an expert civil engineer. Provide a risk assessment in JSON format with these fields: projectName, riskLevel, risks (array), estimatedDelay, budgetImpact, recommendations (array).`,
      },
      {
        role: 'user',
        content: `Assess the risks for this project: Building a 3-story apartment complex in Tegucigalpa during rainy season. Budget: $500K. Timeline: 8 months. Soil tests show high clay content.`,
      },
    ],
  });

  console.log('Method: response_format: { type: "json_object" }');
  console.log('✅ Guarantees valid JSON');
  console.log('⚠️  Does NOT guarantee schema compliance\n');
  console.log('JSON Response:');

  try {
    const parsed = JSON.parse(response.choices[0].message.content);
    console.log(JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.log('Raw response (failed to parse JSON):');
    console.log(response.choices[0].message.content);
  }
}

// ============================================================================
// EXAMPLE 5: STRUCTURED OUTPUTS (Recommended - New in 2024)
// ============================================================================
async function example5_structuredOutputs() {
  console.log('\n' + '='.repeat(80));
  console.log('EXAMPLE 5: STRUCTURED OUTPUTS WITH JSON SCHEMA (Best Practice)');
  console.log('='.repeat(80));
  console.log('Using json_schema for guaranteed schema compliance\n');
  console.log('📖 Introduced August 2024');
  console.log(
    '📚 Docs: https://platform.openai.com/docs/guides/structured-outputs\n',
  );

  // Define exact schema
  const riskAssessmentSchema = {
    type: 'object',
    properties: {
      projectName: {
        type: 'string',
        description: 'Name of the construction project',
      },
      riskLevel: {
        type: 'string',
        enum: ['low', 'medium', 'high', 'critical'],
        description: 'Overall risk level assessment',
      },
      risks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            description: { type: 'string' },
            severity: { type: 'number', minimum: 1, maximum: 10 },
            mitigation: { type: 'string' },
          },
          required: ['category', 'description', 'severity', 'mitigation'],
          additionalProperties: false,
        },
      },
      estimatedDelay: { type: 'string' },
      budgetImpact: { type: 'string' },
      recommendations: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: [
      'projectName',
      'riskLevel',
      'risks',
      'estimatedDelay',
      'budgetImpact',
      'recommendations',
    ],
    additionalProperties: false,
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Works with gpt-4o-mini and gpt-4o-2024-08-06+
    max_tokens: 2048,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'risk_assessment',
        strict: true, // <-- Enforces exact schema compliance
        schema: riskAssessmentSchema,
      },
    },
    messages: [
      {
        role: 'system',
        content:
          'You are an expert civil engineer specializing in risk assessment for construction projects.',
      },
      {
        role: 'user',
        content: `Assess the risks for this project: Building a 3-story apartment complex in Tegucigalpa during rainy season. Budget: $500K. Timeline: 8 months. Soil tests show high clay content.`,
      },
    ],
  });

  console.log('Method: json_schema with strict: true');
  console.log('✅ Guarantees valid JSON');
  console.log('✅ Guarantees exact schema compliance');
  console.log('✅ Type-safe responses\n');
  console.log('JSON Response:');

  try {
    const parsed = JSON.parse(response.choices[0].message.content);
    console.log(JSON.stringify(parsed, null, 2));
  } catch (error) {
    console.log('Raw response (failed to parse JSON):');
    console.log(response.choices[0].message.content);
  }
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================
async function runAllExamples() {
  console.log('\n🎓 PROMPT ENGINEERING EXAMPLES (OpenAI - Research Verified)');
  console.log('Learning: Role Prompting + Few-Shot Learning + JSON Output\n');

  try {
    // await example1_rolePrompting();

    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // await example2_fewShotLearning();

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await example3_roleAndFewShot();

    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // await example4_jsonObjectMode();

    // await new Promise((resolve) => setTimeout(resolve, 1000));
    // await example5_structuredOutputs();

    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL EXAMPLES COMPLETED');
    console.log('='.repeat(80));
    console.log('\nKey Takeaways (OpenAI):');
    console.log('1. System message = Define AI role and expertise');
    console.log(
      '2. Few-shot learning = Teach format through examples (NOT prefilling)',
    );
    console.log('3. json_object mode = Valid JSON (basic)');
    console.log('4. json_schema mode = Exact schema compliance (recommended)');
    console.log('5. OpenAI does NOT support prefilling like Anthropic');
    console.log('\n📚 Official Docs:');
    console.log(
      '- Chat API: https://platform.openai.com/docs/guides/chat-completions',
    );
    console.log(
      '- Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs',
    );
    console.log('\n');
  } catch (error) {
    console.error('Error running examples:', error.message);
    if (error.status === 401) {
      console.error('\n⚠️  Check your OpenAI API key in .env file');
    } else if (error.status === 429) {
      console.error('\n⚠️  Rate limit exceeded. Wait a moment and try again.');
    } else {
      console.error('\n⚠️  Full error:', error);
    }
  }
}

// Run all examples
runAllExamples();
