export default function handler(req, res) {

  // Configuração de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }


  const { id } = req.query;
  const Realtime = "https://jogos-a1a46-default-rtdb.firebaseio.com/cm/.json"; 
  fetch(Realtime)
    .then(response => response.json())
    .then(data => {
      const lista = Object.values(data); 

      const post = lista.filter(postagem => postagem.id === id);
      res.status(200).json(post);
    })
    .catch(error => {
      console.error(error);
      res.status(400).send("erro");
    });
}