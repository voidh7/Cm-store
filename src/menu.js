function toggleMenu() {
      document.getElementById('mobileMenu').classList.toggle('active');
    }
    
    // Criando a navbar
const navbar = document.createElement("nav");
navbar.classList.add("navbar");

const title = document.createElement("h1");
title.textContent = "CM Store";

const menu = document.createElement("div");
menu.classList.add("menu");

const links = [
  { text: "Início", href: "inicio.html" },
  { text: "Configuração", href: "config.html" },
{ text: "Evento", href: "evento.html"},
  { text: "Contato", href: "https://www.instagram.com/caiomultiversando?igsh=MWFpcmYzZDB3YTNzZQ==" },
];

links.forEach((link) => {
  const a = document.createElement("a");
  a.href = link.href;
  a.textContent = link.text;
  menu.appendChild(a);
});

const hamburger = document.createElement("div");
hamburger.classList.add("hamburger");
hamburger.innerHTML = "☰";
hamburger.onclick = toggleMenu;

navbar.appendChild(title);
navbar.appendChild(menu);
navbar.appendChild(hamburger);

document.body.prepend(navbar);

// Criando o menu mobile
const mobileMenu = document.createElement("div");
mobileMenu.classList.add("mobile-menu");
mobileMenu.id = "mobileMenu";

links.forEach((link) => {
  const a = document.createElement("a");
  a.href = link.href;
  a.textContent = link.text;
  mobileMenu.appendChild(a);
});

document.body.appendChild(mobileMenu);



// Função para alternar o menu mobile
function toggleMenu() {
  mobileMenu.style.display = mobileMenu.style.display === "flex" ? "none" : "flex";
}