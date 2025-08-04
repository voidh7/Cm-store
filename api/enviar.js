export default function handler (req, res) {

const {tipo, nome, msg, sala} = req.query
const url = "https://palavras-22e2c-default-rtdb.firebaseio.com/"

const dados = {
nome,
msg
}
if(tipo === "enviar") {

 fetch(`${url}${sala}/.json`, {

method: "PATCH",
headers: {"Content-Type": "application/json"},
body: JSON.stringify(dados)

}).then( response => response.json())
.then(data => {

res.status(200).send("Dados enviados")

}).catch(error => {
res.status(400).send("erro")
})

}

}
