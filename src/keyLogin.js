const botao = document.getElementById("botao-acessar");
const alertas = document.getElementById("mensagem-status");
const linkSuporte = document.getElementById("link-suporte");

botao.addEventListener("click", async () => {
  const id = document.getElementById("identificador-usuario").value.trim();
  const senha = document.getElementById("senha-acesso").value.trim();
  
  if (id && senha) {
    try {
      const response = await fetch(`https://caiolibs.vercel.app/api/keyLog.js?id=${id}&senha=${senha}&acao=login`);
      const data = await response.json();
      
      if (data.login === true) {
        localStorage.setItem("id", id);
        localStorage.setItem("userPassword", senha);
        window.location.href = "keys.html";
      } else {
        alertas.textContent = "Credenciais inválidas. Verifique seu ID e senha.";
      }
    } catch (error) {
      alertas.textContent = "Erro ao conectar com o servidor. Tente novamente mais tarde.";
      console.error("Erro no login:", error);
    }
  } else {
    alertas.textContent = "Por favor, preencha todos os campos.";
  }
});

linkSuporte.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "https://www.instagram.com/programing_js?igsh=MTgzZHBsdmExNWJlbg==";
});