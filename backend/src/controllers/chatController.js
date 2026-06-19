// Helper: sanitize and trim messages to keep requests small and fast
function sanitizeMessages(raw, maxMessages = 8, maxChars = 500) {
  if (!Array.isArray(raw)) return [];
  const cleaned = raw
    .filter(
      m =>
        m &&
        typeof m.content === 'string' &&
        // Includes 'model' (for Gemini history) and 'assistant' (for potential client history)
        ['user', 'assistant', 'model', 'system'].includes(m.role) 
    )
    .map(m => ({ role: m.role, content: m.content.slice(0, maxChars).trim() }));

  // Keep only last N non-system messages
  const nonSystem = cleaned.filter(m => m.role !== 'system');
  return nonSystem.slice(-maxMessages);
}

// Server-enforced system prompt: Trip Assistant only
const SERVER_SYSTEM_PROMPT = [
  'You are "Trip Assistant" for travel planning in India (itineraries, destinations, guides, hotels, safety, budgets).',
  'Only answer questions that are related to travel or planning trips in India. Be concise.', 
  'If a query is too vague, ask one follow-up question. Use bullet points for structured information.',
].join('\n');

// POST /api/chat
exports.createChatCompletion = async (req, res) => {
  try {
    const { messages = [] } = req.body; 

    // Validate and trim client messages
    const trimmed = sanitizeMessages(messages, 8, 500);
    
    if (trimmed.length === 0) {
        return res
            .status(400)
            .json({ message: 'messages must include at least one user/assistant item' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            reply: 'Groq API key is not configured. Please set GROQ_API_KEY in the backend .env file.',
            message: 'GROQ_API_KEY is not set'
        });
    }

    // Format messages for Groq (OpenAI chat completion compatible format)
    const formattedMessages = [
      { role: 'system', content: SERVER_SYSTEM_PROMPT },
      ...trimmed.map(m => ({
        role: m.role === 'model' ? 'assistant' : m.role,
        content: m.content
      }))
    ];

    // Call Groq API with 10s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: formattedMessages,
        temperature: 0.5,
        max_tokens: 256,
        top_p: 0.8
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Groq API responded with status ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
        return res.status(200).json({ 
            reply: 'I am your Trip Assistant. Please ask a concise travel question (dates, destination, budget).', 
            model: 'llama-3.3-70b-versatile',
            note: 'Model generated empty response or was filtered.'
        });
    }

    return res.status(200).json({ reply: text, model: 'llama-3.3-70b-versatile', role: 'assistant' });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] CHAT ERROR:`, error);
    
    const isAbort = error.name === 'AbortError';
    const status = isAbort ? 504 : 500;
    
    let fallback = 'I could not generate a response right now. Please check if the Groq API key is valid and you have internet connectivity.';
    if (isAbort) {
        fallback = 'Taking longer than expected. Please ask one specific travel question (dates, destination, budget).';
    }

    return res.status(status).json({
      reply: fallback,
      message: 'Failed to get response from Groq',
      error: error?.message || String(error),
    });
  }
};