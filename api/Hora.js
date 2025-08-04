export default function handler(req, res) {
  const { dataTime } = req.query;

  const data = new Date();
  const dia = data.getDate();
  const mes = data.getMonth() + 1;
  const ano = data.getFullYear();

  if (dataTime === "dia") {
    return res.status(200).send(dia.toString());
  }

  if (dataTime === "mes") {
    return res.status(200).send(mes.toString());
  }

  if (dataTime === "ano") {
    return res.status(200).send(ano.toString());
  }

  
  return res.status(200).send("sem resposta");
}

