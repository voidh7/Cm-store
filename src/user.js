const i = localStorage.getItem("idUser") || "Não definido"

alert(i)
if(i) {
navigator.clipboard.writeText(i)
}