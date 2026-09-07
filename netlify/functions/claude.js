exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
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

  const payload = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: body.max_tokens || 1000,
    messages: body.messages,
  };
  if (body.system) payload.system = body.system;

  console.log("Payload enviado:", JSON.stringify(payload).slice(0, 300));

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
    console.log("Status:", response.status, "Resposta:", JSON.stringify(data).slice(0, 300));

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: `API ${response.status}: ${JSON.stringify(data)}` }),
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (e) {
    console.error("Erro fetch:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
