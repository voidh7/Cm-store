export default function handler(req, res) {
  // Configurações de CORS seguras
  
  // Permite CORS apenas para o domínio especificado
res.setHeader('Access-Control-Allow-Origin', 'https://cm-store.vercel.app');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

/*
res.setHeader('Access-Control-Allow-Credentials', 'true'); // Opcional, se usar cookies/auth
*/

  // URL do Firebase a partir de variáveis de ambiente
  const FIREBASE_URL = process.env.FIREBASE_URL || "https://jogos-a1a46-default-rtdb.firebaseio.com";

  // Tipos de requisição suportados
  const { games, gameId, developerId, verifiedUsers } = req.query;

  // Handler para usuários verificados
  if (verifiedUsers === "true") {
    return fetch(`${FIREBASE_URL}/vv/.json`)
      .then(response => response.json())
      .then(data => {
        res.status(200).json(data || {});
      })
      .catch(error => {
        console.error("Erro Firebase:", error);
        res.status(500).json({ error: "Erro ao buscar usuários verificados" });
      });
  }

  // Handler para jogos específicos
  if (gameId) {
    return fetch(`${FIREBASE_URL}/jogos/${gameId}/.json`)
      .then(response => response.json())
      .then(game => {
        if (!game) {
          return res.status(404).json({ error: "Jogo não encontrado" });
        }
        res.status(200).json({ ...game, id: gameId });
      })
      .catch(error => {
        console.error("Erro Firebase:", error);
        res.status(500).json({ error: "Erro ao buscar jogo" });
      });
  }

  // Handler para jogos de desenvolvedor
  if (developerId) {
    return fetch(`${FIREBASE_URL}/jogos/.json?orderBy="idUser"&equalTo="${developerId}"`)
      .then(response => response.json())
      .then(data => {
        const games = data ? Object.keys(data).map(id => ({
          ...data[id],
          id
        })) : [];
        res.status(200).json(games);
      })
      .catch(error => {
        console.error("Erro Firebase:", error);
        res.status(500).json({ error: "Erro ao buscar jogos do desenvolvedor" });
      });
  }

  // Handler para todos os jogos
  if (games === "true") {
    return fetch(`${FIREBASE_URL}/jogos/.json`)
      .then(response => response.json())
      .then(data => {
        const games = data ? Object.keys(data).map(id => ({
          ...data[id],
          id
        })) : [];
        res.status(200).json(games);
      })
      .catch(error => {
        console.error("Erro Firebase:", error);
        res.status(500).json({ error: "Erro ao buscar jogos" });
      });
  }

  // Resposta padrão para requisições inválidas
  res.status(400).json({ 
    error: "Parâmetro inválido. Use: ?games=true, ?gameId=ID, ?developerId=ID ou ?verifiedUsers=true",
    example: "https://cm-store.vercel.app/api/games.js?games=true"
  });
}