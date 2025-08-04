// api/eventos.js
export default async function handler(req, res) {
    // Configurações de CORS para GET
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Verificação de segurança básica
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Aceita apenas método GET
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: "Método não permitido. Esta API aceita apenas GET."
        });
    }

    const { nomeJogo, id, nomeEvento, minutos, acao } = req.query;

    // Validação básica dos parâmetros
    if (!nomeJogo || !id) {
        return res.status(400).json({
            success: false,
            message: "Parâmetros obrigatórios faltando: nomeJogo e id (do usuário)"
        });
    }

    // URLs do Firebase
    const basePath = `https://meu-diario-79efa-default-rtdb.firebaseio.com/${encodeURIComponent(nomeJogo)}/usuarios/${encodeURIComponent(id)}/eventos`;
    const urlEvento = `${basePath}/${encodeURIComponent(nomeEvento)}.json`;
    const urlTodosEventos = `${basePath}.json`;

    try {
        // Operação baseada no parâmetro acao
        switch (acao) {
            case 'criar':
                return await criarEvento();
            case 'ler':
                return await lerEvento();
            default:
                return res.status(400).json({
                    success: false,
                    message: "Parâmetro 'acao' inválido ou faltando. Use 'criar' ou 'ler'"
                });
        }
    } catch (erro) {
        console.error("Erro na API de eventos:", erro);
        return res.status(500).json({
            success: false,
            message: "Erro interno no servidor"
        });
    }

    async function criarEvento() {
        if (!nomeEvento || !minutos) {
            return res.status(400).json({
                success: false,
                message: "Para criar um evento são necessários: nomeEvento e minutos"
            });
        }

        const duracao = parseInt(minutos);
        if (isNaN(duracao)) {
            return res.status(400).json({
                success: false,
                message: "O parâmetro 'minutos' deve ser um número válido"
            });
        }

        // Verificar limite de eventos (máximo 5 por usuário)
        const eventosResponse = await fetch(urlTodosEventos);
        const eventos = await eventosResponse.json();
        const totalEventos = eventos ? Object.keys(eventos).length : 0;

        if (totalEventos >= 5) {
            const eventosAtivos = eventos ? Object.values(eventos).filter(e => e.status === "on") : [];
            if (eventosAtivos.length > 0) {
                return res.status(429).json({
                    success: false,
                    message: "Limite de 5 eventos atingido. Finalize os eventos ativos antes de criar novos.",
                    eventosAtivos: eventosAtivos.map(e => e.nomeEvento)
                });
            }
            
            // Se todos estiverem inativos, limpa antes de criar
            await fetch(urlTodosEventos, { method: 'DELETE' });
        }

        // Criar novo evento
        const agora = Date.now();
        const dadosEvento = {
            nomeEvento,
            criadoEm: agora,
            minutos: duracao,
            fim: agora + (duracao * 60000),
            status: "on",
            atualizadoEm: agora,
            criadoPor: id
        };

        const resposta = await fetch(urlEvento, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosEvento)
        });

        if (!resposta.ok) throw new Error("Falha ao criar evento no Firebase");

        return res.status(200).json({
            success: true,
            message: `Evento '${nomeEvento}' criado com sucesso`,
            data: dadosEvento
        });
    }

    async function lerEvento() {
    if (!nomeEvento) {
        return res.status(400).send(`Parâmetro obrigatório faltando: nomeEvento`);
    }

    // Consultar evento
    const resposta = await fetch(urlEvento);
    const dadosEvento = await resposta.json();

    if (!dadosEvento) {
        return res.status(404).send(`Evento '${nomeEvento}' não encontrado`);
    }

    // Calcular status em tempo real
    const agora = Date.now();
    const statusAtual = agora >= dadosEvento.fim ? "off" : "on";

    // Se o status mudou, atualizar no Firebase
    if (statusAtual === "off" && dadosEvento.status !== "off") {
        const dadosAtualizados = {
            ...dadosEvento,
            status: "off",
            atualizadoEm: agora
        };

        await fetch(urlEvento, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAtualizados)
        });
    }

    return res.status(200).send(statusAtual);
}
}