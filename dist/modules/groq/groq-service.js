"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askGroq = askGroq;
async function askGroq(messages) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant", // Corrigido: era llama, não llhama
            max_tokens: 1000,
            temperature: 0.7,
            messages,
        }),
    });
    const data = await response.json();
    // Verifica se a resposta contém o que esperamos
    if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
    }
    else {
        // Loga o erro real que a API mandou para você saber o que houve
        console.error("Erro na API do Groq:", data);
        throw new Error(data.error?.message || "Erro desconhecido ao acessar o Groq");
    }
}
//# sourceMappingURL=groq-service.js.map