const html = `
  <html>
    <head><title>Manutenção</title></head>
    <body style="font-family:sans-serif; text-align:center; padding:2rem;">
      <h1>Estamos em manutenção</h1>
      <p>Volte em breve. 🙏</p>
    </body>
  </html>
`;

export function middleware(req) {
  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html"
    }
  });
}