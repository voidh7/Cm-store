export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const agora = new Date();
      const hora = agora.getHours();
      let mensagem;

      // Definir mensagens baseadas no horário
      if (hora >= 5 && hora < 12) {
        mensagem = {
          pt: "Bom dia, campeão! 🎮 Que tal dar uma olhada nos jogos da CM STORE antes do café? Tem ofertas quentinhas esperando por você!",
          en: "Good morning, champion! 🎮 How about checking out CM STORE games before coffee? Hot offers are waiting for you!"
        };
      } else if (hora >= 12 && hora < 18) {
        mensagem = {
          pt: "Pô, vem aqui, c sumiu hj<3",
          en: "Lunch time and bored? 😴 Check out CM STORE for awesome games! #JustSaying"
        };
      } else if (hora >= 18 && hora < 23) {
        mensagem = {
          pt: "Noitada chegando e você sem jogo novo? 🎲 Corre pra CM STORE antes que acabe os estoques (mentira, é digital kkk)!",
          en: "Night is coming and no new game? 🎲 Run to CM STORE before stocks run out (just kidding, it's digital lol)!"
        };
      } else {
        mensagem = {
          pt: "Tá acordado a essa hora? 👀 Já que tá sem sono, aproveita e garante uns jogos da CM STORE pra jogar amanhã!",
          en: "Awake at this hour? 👀 Since you're not sleepy, grab some CM STORE games to play tomorrow!"
        };
      }

      // Enviar notificação via OneSignal
      const notificacaoResponse = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic os_v2_app_sratmhknejadjay5dyvabk4nybz7xsdi5bkenzuhu2fip7mp3fbz4ffcby7jnz3dz2s56rddwtl5g4fywfyk22n4one76mhtzsfu53y"
        },
        body: JSON.stringify({
          app_id: "9441361d-4d22-4034-831d-1e2a00ab8dc0",
          included_segments: ["All"],
          headings: { 
            pt: "CM STORE te chamando! 🎮", 
            en: "CM STORE calling you! 🎮" 
          },
          contents: mensagem,
          url: "https://cm-store.vercel.app/index.html"
        })
      });

      if (!notificacaoResponse.ok) {
        throw new Error("Erro ao enviar notificação");
      }

      return res.status(200).json({ 
        success: true, 
        message: "Notificação enviada com sucesso!",
        horario: `${hora}:${agora.getMinutes()}`,
        mensagem_enviada: mensagem.pt
      });

    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        erro: "Erro no servidor: " + error.message 
      });
    }
  }

  // Se o método não for GET
  return res.status(405).json({ message: "Método não permitido" });
}