import express from "express";

const router = express.Router();

// NVIDIA NIM OpenAI-compatible endpoint
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "meta/llama-4-maverick-17b-128e-instruct";

/** Types that require a structured JSON response from the model. */
const JSON_TYPES = new Set(["skill-gap", "smart-recommendations", "job-match", "scheme-check", "resume"]);

/**
 * Extract the first valid JSON object or array from a string.
 * Handles cases where the model wraps its output in markdown code fences
 * (```json … ```) despite being asked not to.
 */
function extractJSON(raw) {
  // Strip markdown code fences if present
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1].trim() : raw.trim();

  // Find the first '{' or '[' and the matching closing bracket
  const start = candidate.search(/[\[{]/);
  if (start === -1) return candidate; // Return as-is; JSON.parse will fail with a clear message

  // Walk forward to find the matching close bracket
  const open = candidate[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let end = -1;
  for (let i = start; i < candidate.length; i++) {
    if (candidate[i] === open) depth++;
    else if (candidate[i] === close) {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  return end !== -1 ? candidate.slice(start, end + 1) : candidate.slice(start);
}

/**
 * Collect all SSE `data:` chunks from an NVIDIA stream into a single string.
 */
async function collectStream(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let textBuffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, idx);
      textBuffer = textBuffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") break;
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) full += c;
      } catch { /* skip malformed SSE line */ }
    }
  }
  return full;
}

/**
 * POST /ai-assistant
 *
 * Accepts { messages, type, userProfile } and streams an SSE response from
 * the NVIDIA NIM API (meta/llama-4-maverick-17b-128e-instruct) using the OpenAI-compatible
 * endpoint.
 *
 * For general chat the response is piped straight through as standard SSE.
 * For structured JSON types (skill-gap, smart-recommendations, job-match,
 * scheme-check, resume) the stream is collected, any markdown fences are
 * stripped, and the clean JSON is emitted as a single SSE event so that
 * clients can always do a simple `JSON.parse(full)` without worrying about
 * model formatting quirks.
 *
 * Supported `type` values:
 *   "skill-gap"             – returns JSON skill-gap analysis
 *   "smart-recommendations" – returns JSON personalised recommendations
 *   "job-match"             – returns JSON job match scores
 *   "scheme-check"          – returns JSON scheme eligibility
 *   "resume"                – returns JSON resume / profile feedback
 *   (anything else)         – general conversational assistant (streamed)
 */
router.post("/", async (req, res) => {
  const { messages, type, userProfile } = req.body;

  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
  if (!NVIDIA_API_KEY) {
    return res.status(500).json({ error: "NVIDIA_API_KEY is not configured. Add it to backend/.env (see backend/.env.example)." });
  }

  // Build system prompt based on request type
  let systemPrompt = `You are the DivyangConnectAI AI Assistant — a helpful, empathetic, and knowledgeable guide for persons with disabilities (PWD) in India.
  
Your role:
- Help users find suitable jobs, government schemes, courses, and services
- Provide career guidance and skill improvement suggestions
- Analyse resumes and provide feedback
- Check scheme eligibility based on user data
- Be sensitive, encouraging, and accessibility-aware

User Profile Context:
${userProfile ? JSON.stringify(userProfile, null, 2) : "No profile data available"}

Guidelines:
- Always be respectful about disability
- Provide actionable, specific recommendations
- Mention scheme names, eligibility criteria, and deadlines when relevant
- Suggest skill improvements based on job market trends
- Keep responses concise but thorough
- Support both Hindi and English queries`;

  if (type === "skill-gap") {
    systemPrompt = `You are an AI Skill Gap Analyser. Given a user's current skills and their target job role, analyse the gap.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "skills": [
    {"name": "Skill Name", "current": 0-100, "target": 80-100, "gap": "description of gap and what to learn", "status": "gap|on-track|complete"}
  ],
  "insight": "One paragraph of actionable career advice",
  "overallReadiness": 0-100
}
Analyse 4-6 relevant skills. Be specific about what to learn. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
  } else if (type === "smart-recommendations") {
    systemPrompt = `You are an AI recommendation engine for persons with disabilities in India. Based on the user's profile (skills, disability type, education, location), suggest personalised opportunities.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "recommendations": [
    {"type": "job|scheme|course", "title": "Title", "subtitle": "Provider or details", "match": 0-100, "reason": "Why this matches", "tags": ["tag1"], "action": "Apply Now|Check Eligibility|Start Learning"}
  ]
}
Return exactly 3 recommendations: 1 job, 1 scheme, 1 course. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
  } else if (type === "job-match") {
    systemPrompt = `You are an AI Job Match Scorer. Given a user's profile and a list of jobs, score each job for compatibility.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "matches": [
    {"jobId": "id", "score": 0-100, "reasons": ["reason1", "reason2"], "missingSkills": ["skill1"]}
  ]
}
Be accurate based on skill overlap, accessibility needs, and location. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
  } else if (type === "scheme-check") {
    systemPrompt = `You are an AI Government Scheme Eligibility Advisor for persons with disabilities in India.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "schemes": [
    {"name": "Scheme Name", "ministry": "Ministry Name", "eligible": true, "confidence": 0-100, "reason": "Why eligible or not", "action": "What to do next"}
  ],
  "summary": "Overall assessment and top recommendation",
  "totalEligible": 0
}
Analyse all government schemes relevant to PWD. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
  } else if (type === "resume") {
    systemPrompt = `You are an expert AI Resume & Career Advisor specialising in helping persons with disabilities (PWD) in India find employment.
Analyse the user's profile and provide detailed, actionable feedback.
Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "score": 0-100,
  "strengths": ["strength1", "strength2"],
  "improvements": [{"area": "Area Name", "issue": "What's missing", "suggestion": "How to fix it"}],
  "profileSummary": "A professional bio paragraph they can use",
  "keyRecommendations": ["rec1", "rec2", "rec3"],
  "pwdTips": ["tip1", "tip2"]
}
Be encouraging, specific, and disability-inclusive in your feedback. User Profile: ${userProfile ? JSON.stringify(userProfile) : "No profile"}`;
  }

  try {
    // NVIDIA NIM uses the same OpenAI messages format — include system prompt
    // as the first message with role "system".
    const nimMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system"),
    ];

    const aiResponse = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: nimMessages,
        max_tokens: 2048,
        temperature: 1.0,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return res
          .status(429)
          .json({ error: "Rate limit exceeded. Please try again in a moment." });
      }
      if (aiResponse.status === 401 || aiResponse.status === 403) {
        return res
          .status(aiResponse.status)
          .json({ error: "Invalid or unauthorised NVIDIA API key. Please check your NVIDIA_API_KEY." });
      }
      const errText = await aiResponse.text();
      console.error("NVIDIA NIM API error:", aiResponse.status, errText);
      return res.status(500).json({ error: "AI service error" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (JSON_TYPES.has(type)) {
      // For structured JSON types: collect, clean, re-emit as a single SSE
      // event so clients never need to worry about markdown code fences.
      const raw = await collectStream(aiResponse.body);
      const clean = extractJSON(raw);
      // Emit as a standard OpenAI SSE delta so the existing client-side
      // streaming parser keeps working without any changes.
      const delta = { choices: [{ delta: { content: clean }, finish_reason: "stop" }] };
      res.write(`data: ${JSON.stringify(delta)}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    } else {
      // For general chat: pipe the NIM stream directly to the client.
      const reader = aiResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    }
  } catch (err) {
    console.error("Error in /ai-assistant:", err);
    res
      .status(500)
      .json({ error: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default router;
