exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "ANTHROPIC_API_KEY não configurada" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Body inválido: " + e.message }) };
  }

  // garantir campos obrigatórios
  const payload = {
    model: body.model || "claude-sonnet-5",
    max_tokens: body.max_tokens || 1000,
    messages: body.messages,
  };
  if (body.system) payload.system = body.system;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // logar erro da API para diagnóstico
    if (!response.ok) {
      console.error("Anthropic API error:", response.status, JSON.stringify(data));
    }

    return { statusCode: response.status, headers, body: JSON.stringify(data) };
  } catch (e) {
    console.error("Fetch error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
