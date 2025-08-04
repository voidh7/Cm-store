export default function handler(req, res) {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const origem = req.headers.origin || req.headers.referer || "";
const userAgent = req.headers["user-agent"] || "";

if (!userAgent.includes("Catrobatbot") && !origem.includes("https://cm-store.vercel.app")) {
  return res.status(500).send("Permission denied");
}

    

    const banco = "https://meu-diario-79efa-default-rtdb.firebaseio.com/arquivos";
    const TEMPO_LEITURA = 2000; // 5 segundo entre leituras
    const TEMPO_ESCRITA = 3000; // 3 segundos entre gravações
    const TEMPO_BLOQUEIO_BASE = 10000; // 10 segundos de bloqueio base

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { acao, nomeJogo, id, nomeArquivo, valor, evento, nomeEvento, minutos } = req.query;


    const jogoURL = encodeURIComponent(nomeJogo);
    const arquivoURL = encodeURIComponent(nomeArquivo);

    if (!acao || !nomeJogo || !nomeArquivo || !id) {
        return res.status(200).send("Erro: falta informações");
    }

    // Verifica se o jogo está bloqueado
    fetch(`${banco}/${jogoURL}/block.json`)
        .then(response => response.json())
        .then(blockData => {
            const agora = new Date().getTime();

            if (blockData && blockData.block === true && agora < blockData.tempo) {
                return res.status(200).send("Erro: jogo bloqueado por " + Math.round((blockData.tempo - agora)/1000) + " segundos");
            }

            if (acao === "ler") {
                // Verifica intervalo entre leituras
                fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}/ultimaLeitura.json`)
                    .then(response => response.json())
                    .then(ultimaLeitura => {
                        if (ultimaLeitura && (agora - ultimaLeitura) < TEMPO_LEITURA) {
                            return res.status(200).send("Aguarde 1 segundo entre leituras");
                        }

                        // Atualiza tempo da última leitura
                        fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}/ultimaLeitura.json`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(agora)
                        });

                        // Faz a leitura dos dados
                        fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}.json`)
                            .then(response => response.json())
                            .then(data => {
                                res.status(200).send(data?.valor || "Erro: nada encontrado");
                            })
                            .catch(error => res.status(200).send("Erro ao ler dados: " + error.message));
                    });

            } else if (acao === "salvar") {
                if (!valor) return res.status(200).send("Erro: valor vazio");

                // Verifica intervalo entre gravações
                fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}/ultimaModificacao.json`)
                    .then(response => response.json())
                    .then(ultimaMod => {
                        if (ultimaMod && (agora - ultimaMod) < TEMPO_ESCRITA) {
                            // Calcula o tempo de bloqueio incremental
                            const violacoes = blockData?.violacoes || 0;
                            const tempoBloqueio = TEMPO_BLOQUEIO_BASE + (violacoes * 10000); // +10 segundos por violação

                            const blockContent = {
                                block: true,
                                tempo: agora + tempoBloqueio,
                                violacoes: violacoes + 1
                            };

                            fetch(`${banco}/${jogoURL}/block.json`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(blockContent)
                            });

                            return res.status(200).send(`Erro: espere 3 segundos entre modificações. Jogo bloqueado por ${tempoBloqueio/1000} segundos`);
                        }

                        // Grava os dados
                        const content = {
                            userAgent,
                            origem,
                            valor: valor,
                            ultimaModificacao: agora
                        };

                        fetch(`${banco}/${jogoURL}/${id}/${arquivoURL}.json`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(content)
                        })
                        .then(() => res.status(200).send("Salvo com sucesso"))
                        .catch(error => res.status(200).send("Erro ao salvar: " + error.message));
                    });
            }
        })
        .catch(error => res.status(200).send("Erro: " + error.message));
}