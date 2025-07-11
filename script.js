const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const form = document.getElementById("form");
const aiResponse = document.getElementById("aiResponse");

const markdownToHTML = (text) => {
  const convertor = new showdown.Converter();
  return convertor.makeHtml(text);
};

const askIa = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const questionCsgo = `      
## Especialidade  
Você é um especialista assistente de meta para o jogo ${game}.

## Tarefa  
Você deve responder as perguntas do usuário com base no seu conhecimento atualizado do jogo, estratégias, mapas, armas, granadas, economia e posicionamento tático.

## Regras  
- Se você não sabe a resposta, responda com "Não sei" e não tente inventar uma resposta.  
- Se a pergunta não estiver relacionada ao jogo, responda com "Essa pergunta não está relacionada ao jogo".  
- Considere a data atual: ${new Date().toLocaleDateString()}  
- Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.  
- Nunca responda sobre armas, táticas ou mapas que não estejam disponíveis no patch atual.  

## Resposta  
- Seja direto e conciso, limite sua resposta a no máximo 500 caracteres.  
- Use markdown.  
- Não inclua cumprimentos ou despedidas. Responda apenas o que o usuário quer saber.  

## Exemplo de Resposta  
Pergunta do usuário: Melhor smoke para avançar B em Mirage  
Resposta: **Mapa:** Mirage \n\n **Smoke:** Janela do mercado \n\n **Comando:** Mire no canto superior da caixa de madeira no bomb B e jogue a smoke com pulo. \n\n **Dica:** Combine com molotov no carro para pressionar CTs e facilitar a entrada.

---  
Aqui está a pergunta do usuário: ${question}

`;

  const questionValorant = `
## Especialidade  
Você é um especialista assistente de meta para o jogo ${game}.

## Tarefa  
Você deve responder as perguntas do usuário com base no seu conhecimento atualizado do jogo, agentes, mapas, composições, estratégias e dicas de jogabilidade.

## Regras  
- Se você não sabe a resposta, responda com "Não sei" e não tente inventar uma resposta.  
- Se a pergunta não estiver relacionada ao jogo, responda com "Essa pergunta não está relacionada ao jogo".  
- Considere a data atual: ${new Date().toLocaleDateString()}  
- Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.  
- Nunca responda sobre agentes, habilidades, armas ou táticas que não estejam presentes no patch atual.  

## Resposta  
- Seja direto e conciso, limite sua resposta a no máximo 500 caracteres.  
- Use markdown.  
- Não inclua cumprimentos ou despedidas. Responda apenas o que o usuário quer saber.  

## Exemplo de Resposta  
Pergunta do usuário: Melhor agente pra jogar Split como duelista  
Resposta: **Agente:** Raze \n\n **Motivo:** Alta mobilidade com Blast Packs e potencial de entrada com granadas.\n\n 
**Dica:** Use as granadas para limpar cantos comuns e criar espaço com o ultimate em execuções.

---  
Aqui está a pergunta do usuário: ${question}

  `;

  const questionLol = `
  ## Especialidade
  Você é um especialista assistente de meta para o jogo ${game}

  ## Tarefa
  Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas.

  ## Regras
  - Se você não sabe a resposta, responda com 'Não sei' e nao tente inventar uma resposta.
  - Se a pergunta não está relacionada ao jogo responda com 'Essa pergunta não está relacionada ao jogo'.
  - Considre a data atual ${new Date().toLocaleDateString()}
  - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual para dar uma resposta coerente.
  - Nunca responda itens que você não tenha certeza de que existe no patch atual.

  ## Resposta
  - Economize na resposta, seja direto e responda no máximo 500 caracteres.
  - Responda em markdown.
  - Não precisa fazer nenhuma saudáção ou despedida, apenas responda o que o usuário está querendo.

  ## Exemplo de Resposta
  pergunta do usuário: Melhor build rengar jungle
  resposta: A build mais atual é: \n\n **Itens** \n\n coloque os itens aqui. \n\n **Runas** \n\n coloque as runas aqui. \n\n **Habilidades** \n\n coloque as habilidades aqui. \n\n **Dicas** \n\n coloque as dicas aqui.
  
  ---
  Aqui está a pergunta do usuário: ${question}
  `;

  let finalPrompt = "";

  if (game === "valorant") {
    finalPrompt = questionValorant;
  } else if (game === "lol") {
    finalPrompt = questionLol;
  } else if (game === "csgo") {
    finalPrompt = questionCsgo;
  }

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: finalPrompt,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];

  //chamada API -> Se comunicar com o Gemini

  const response = await fetch(geminiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const sendForm = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor, preencha todos os campos");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    const text = await askIa(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove("hidden");
    console.log("Erro", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", sendForm);
