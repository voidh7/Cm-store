export default async function handler(req, res) {


res.setHeader('Access-Control-Allow-Origin', 'https://cm-store.vercel.app');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

/*
res.setHeader('Access-Control-Allow-Credentials', 'true'); // Opcional, se usar cookies/auth
*/
  const IMGBB_API_KEY = process.env.IMGBB_API_KEY || "0863e0eee12396e6097628c10fdc5228";
  const FIREBASE_URL = process.env.FIREBASE_URL || "https://jogos-a1a46-default-rtdb.firebaseio.com";

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { gameData, images, packageId } = req.body;

    if (!packageId || !gameData || !gameData.nome || !gameData.idUser) {
      return res.status(400).json({ error: 'Dados incompletos. Package ID e dados do jogo são obrigatórios.' });
    }

    if (gameData.link && !gameData.link.includes('mediafire.com' || "mega.nz)) {
      return res.status(400).json({ error: ' oi fofo,Apenas links do MediaFire  ou mega são aceitos para download' });
    }

    if (gameData.video && gameData.video.includes('youtube.com')) {
      gameData.video = gameData.video
        .replace('watch?v=', 'embed/')
        .replace('youtu.be/', 'youtube.com/embed/');
    }

    let uploadedIcon = null;
    let uploadedPrints = [];
    
    if (images && images.length > 0) {
      if (images[0]) {
        const iconFormData = new FormData();
        iconFormData.append('image', images[0].split(',')[1]);

        const iconResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: iconFormData
        });

        const iconData = await iconResponse.json();
        if (iconData.success) {
          uploadedIcon = iconData.data.url;
        }
      }

      for (let i = 1; i < images.length; i++) {
        const image = images[i];
        const formData = new FormData();
        formData.append('image', image.split(',')[1]);

        const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData
        });

        const imgbbData = await imgbbResponse.json();
        if (imgbbData.success) {
          uploadedPrints.push(imgbbData.data.url);
        }
      }
    }

    const gameToSave = {
      ...gameData,
      icone: uploadedIcon,
      prints: uploadedPrints, 
      dataEnvio: new Date().toISOString(),
      dev: gameData.dev || 'Desenvolvedor não especificado'
    };

    const firebaseResponse = await fetch(`${FIREBASE_URL}/jogos/${packageId}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gameToSave)
    });

    const firebaseData = await firebaseResponse.json();

    if (!firebaseResponse.ok) {
      throw new Error('Erro ao salvar no banco de dados');
    }

    res.status(200).json({ 
      success: true, 
      gameId: packageId
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      details: error.message 
    });
  }
}
