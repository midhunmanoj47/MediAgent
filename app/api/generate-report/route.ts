import { NextRequest, NextResponse } from 'next/server';
import { db, sessionchattable } from '../../../config/db';
import { randomUUID } from 'crypto';

interface MedicalReport {
  sessionld: string;
  agent: string;
  user: string;
  timestamp: string;
  chiefComplaint: string;
  summary: string;
  symptoms: string[];
  duration: string;
  severity: string;
  medicationsMentioned: string[];
  recommendations: string[];
}

function generateFallbackReport(doctor: string, user: string, isError = false): MedicalReport {
  return {
    sessionld: randomUUID(),
    agent: `${doctor || 'Doctor'} AI`,
    user: user || 'Anonymous',
    timestamp: new Date().toISOString(),
    chiefComplaint: isError 
      ? 'Error generating report' 
      : 'Unable to generate detailed report – missing API key.',
    summary: isError
      ? 'There was an error generating the medical report. Please try again later.'
      : 'Please configure OPENROUTER_API_KEY or OPENAI_API_KEY in the environment to enable full report generation.',
    symptoms: [],
    duration: '',
    severity: isError ? 'unknown' : 'mild',
    medicationsMentioned: [],
    recommendations: isError
      ? ['Please try the call again', 'Contact support if the issue persists']
      : ['Configure API keys']
  };
}

export async function POST(req: NextRequest) {
  try {
    console.log('generate-report API called');
    const { conversation = [], doctor = 'General Physician', user = 'Anonymous' } = await req.json();
    console.log('Request body:', { conversation, doctor, user });
    
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENROUTER_API_KEY && !OPENAI_API_KEY) {
      console.warn('No LLM API key found, returning mock report');
      return NextResponse.json(generateFallbackReport(doctor, user));
    }

    const prompt = `You are an AI Medical Voice Agent that just finished a voice conversation with a user. Based on the transcript, generate a structured report with the following fields:
1. sessionld: a unique session identifier
2. agent: the medical specialist name (e.g., "General Physician AI")
3. user: name of the patient or "Anonymous" if not provided
4. timestamp: current date and time in ISO format
5. chiefComplaint: one-sentence summary of the main health concern
6. summary: a 2-3 sentence summary of the conversation, symptoms, and recommendations
7. symptoms: list of symptoms mentioned by the user
8. duration: how long the user has experienced the symptoms
9. severity: mild, moderate, or severe
10. medicationsMentioned: list of any medicines mentioned
11. recommendations: list of AI suggestions (e.g., rest, see a doctor)

Return the result in this JSON format:
{
  "sessionld": "string",
  "agent": "string",
  "user": "string",
  "timestamp": "ISO Date string",
  "chiefComplaint": "string",
  "summary": "string",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}

Only include valid fields. Respond with valid JSON only.

Transcript:
${Array.isArray(conversation) ? conversation.join('\n') : ''}`;

    async function callLLM(prompt: string): Promise<string> {
      const requestBody = {
        model: OPENROUTER_API_KEY ? 'mistralai/mistral-7b-instruct:free' : 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful medical AI assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 600,
      };

      const apiUrl = OPENROUTER_API_KEY 
        ? 'https://openrouter.ai/api/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      
      const apiKey = OPENROUTER_API_KEY || OPENAI_API_KEY;

      console.log('Sending request to LLM with prompt:', prompt);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('LLM API response:', JSON.stringify(data, null, 2));
        
        if (!response.ok) {
          throw new Error(`LLM API error: ${data.error?.message || response.statusText}`);
        }
        
        return data.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('Error calling LLM API:', error);
        throw error;
      }
    }

    // Helper to attempt parsing with optional retry
    async function getValidReport(maxAttempts = 2): Promise<{report?: MedicalReport, error?: Error}> {
      let attempt = 0;
      let lastErr: Error | undefined;
      while (attempt < maxAttempts) {
        attempt++;
        const llmResponse = await callLLM(
          attempt === 1 ? prompt : `${prompt}\n\nRespond ONLY with the JSON object.`
        );
        console.log(`Raw LLM response (attempt ${attempt}):`, llmResponse);
        let jsonString = llmResponse.trim();
        const jsonMatch = jsonString.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (jsonMatch) jsonString = jsonMatch[1];
        if (!jsonString) {
          lastErr = new Error('Empty response from LLM');
          continue;
        }
        try {
          const parsed: MedicalReport = JSON.parse(jsonString);
          return { report: parsed };
        } catch (e:any) {
          lastErr = e;
          console.warn('JSON parse failed, retrying if attempts remain');
        }
      }
      return { error: lastErr || new Error('Unknown LLM error') };
    }

    try {
      const { report: parsedReport, error: parseErr } = await getValidReport();
      if (!parsedReport) throw parseErr;

      const report = parsedReport as MedicalReport;
      report.sessionld = report.sessionld || randomUUID();
      report.agent = report.agent || `${doctor} AI`;
      report.user = report.user || user || 'Anonymous';
      report.timestamp = report.timestamp || new Date().toISOString();
      report.symptoms = report.symptoms || [];
      report.medicationsMentioned = report.medicationsMentioned || [];
      report.recommendations = report.recommendations || [];

      // Save to database
      try {
        await db.insert(sessionchattable).values({
          sessionId: report.sessionld,
          notes: '',
          conversation: conversation,
          report: report,
          createdBy: user || 'Anonymous',
        });
        console.log('Successfully saved report to database');
      } catch (dbError) {
        console.error('Database save error (non-fatal):', dbError);
        // Continue even if database save fails
      }

      return NextResponse.json(report);
    } catch (error) {
      console.error('Error generating report:', error);
      return NextResponse.json(generateFallbackReport(doctor, user, true), { status: 500 });
    }
  } catch (error) {
    console.error('Fatal error in generate-report endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 