const xssProtect = {
  sanitize: (input) => {
    if (!input) return '';
    return String(input)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;');
  },
  sanitizeHTML: (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }
};

window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  const fab = document.getElementById('fab');
  if (window.scrollY > 300) {
    fab.style.display = 'flex';
  } else {
    fab.style.display = 'none';
  }
});

function toggleMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  mobileMenu.style.display = mobileMenu.style.display === "flex" ? "none" : "flex";
}

document.querySelectorAll('.mobile-menu a').forEach(item => {
  item.addEventListener('click', () => {
    document.getElementById("mobileMenu").style.display = "none";
  });
});

const fab = document.getElementById("fab");
if (localStorage.getItem("modo") !== "1") {
  fab.style.display = "none";
}

if (!localStorage.getItem("idUser")) {
  localStorage.setItem('idUser', Math.random().toString(36).substring(2, 12));
  const nome = prompt("Digite seu nome:");
  localStorage.setItem("nome", nome ? xssProtect.sanitize(nome) : "Usuário");
}

document.getElementById('profileName').textContent = 
  xssProtect.sanitize(localStorage.getItem("nome") || "Usuário") + " | ID: " + 
  xssProtect.sanitize(localStorage.getItem("idUser") || "");

document.getElementById('profilePicInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file && file.type.match('image.*')) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        document.getElementById('profilePic').src = img.src;
        localStorage.setItem('profilePic', img.src);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

if (localStorage.getItem('profilePic')) {
  document.getElementById('profilePic').src = localStorage.getItem('profilePic');
}

document.getElementById('postImage').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file && file.type.match('image.*')) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const img = new Image();
      img.onload = function() {
        document.getElementById('imagePreview').src = img.src;
        document.getElementById('imagePreviewContainer').style.display = 'block';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function removeImage() {
  document.getElementById('postImage').value = '';
  document.getElementById('imagePreviewContainer').style.display = 'none';
}

async function createPost() {
  const postText = xssProtect.sanitizeHTML(document.getElementById('postText').value.trim());
  const messageDiv = document.getElementById('message');
  const submitBtn = document.getElementById('postSubmit');

  messageDiv.innerHTML = '';
  messageDiv.className = 'message';

  if (postText.length < 50) {
    messageDiv.textContent = 'A publicação precisa ter pelo menos 50 caracteres.';
    messageDiv.className = "message error";
    return;
  }

  if (postText.length > 500) {
    messageDiv.textContent = 'A publicação precisa ter menos de 500 caracteres.';
    messageDiv.className = "message error";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '&#x26A0; Publicando...';

  try {
    const fileInput = document.getElementById('postImage');
    const file = fileInput.files[0];
    const profilePic = localStorage.getItem('profilePic') || '';
    const userName = xssProtect.sanitize(localStorage.getItem('nome') || 'Usuário');

    if (file && file.size > 2 * 1024 * 1024) {
      throw new Error("A imagem não pode ser maior que 2MB");
    }

    const postData = {
      texto: postText,
      imagemPerfil: profilePic,
      nome: userName,
      data: new Date().toISOString(),
      id: Date.now().toString()
    };

    if (file) {
      postData.imagem = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    }

    const response = await fetch('https://caiolibs.vercel.app/api/postComunit', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }

    messageDiv.textContent = 'Publicação enviada com sucesso!';
    messageDiv.className = "message success";

    document.getElementById('postText').value = '';
    fileInput.value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';

    await loadPosts();

  } catch (error) {
    messageDiv.textContent = error.message;
    messageDiv.className = "message error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Publicar';
  }
}

async function loadPosts() {
  const postsContainer = document.getElementById('postsContainer');
  postsContainer.innerHTML = 'Carregando...';

  try {
    const response = await fetch('https://caiolibs.vercel.app/api/postComunit.js');
    const data = await response.json();

    if (!data) throw new Error("Nenhuma publicação encontrada");

    const postsArray = Object.values(data).sort((a, b) => {
      return new Date(b.data || 0) - new Date(a.data || 0);
    });

    postsContainer.innerHTML = '';
    postsArray.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'post';

      const safeContent = xssProtect.sanitizeHTML(post.texto || '');
      const safeName = xssProtect.sanitize(post.nome || 'Usuário');
      const safeDate = post.data ? new Date(post.data).toLocaleString() : 'Data desconhecida';

      postElement.innerHTML = `
        <div class="post-header">
          <img src="${post.imagemPerfil || 'default-profile.png'}" class="post-user-pic" alt="${safeName}">
          <div class="post-user-info">
            <div class="post-username">${safeName}</div>
            <div class="post-date">${safeDate}</div>
          </div>
        </div>
        <div class="post-content">${safeContent}</div>
        ${post.imagem ? `<img src="${post.imagem}" class="post-image" onerror="this.style.display='none'">` : ''}
      `;

      postsContainer.appendChild(postElement);
    });

  } catch (error) {
    postsContainer.innerHTML = `Erro ao carregar: ${xssProtect.sanitize(error.message)}`;
  }
}

document.addEventListener("DOMContentLoaded", function() {
  loadPosts();
});
</script>
</body>
</html>bled = false;
    }, 2000);
  }
}

// Função auxiliar para converter arquivo para base64 (mantida da versão anterior)
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}



    // Load posts from server
    async function loadPosts() {
      const postsContainer = document.getElementById('postsContainer');

      try {
        postsContainer.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #FFA000;"></i>
            <p style="margin-top: 10px;">Carregando publicações...</p>
          </div>
        `;

        const response = await fetch('https://caiolibs.vercel.app/api/postComunit.js');
        const data = await response.json();

        if (!data || typeof data !== 'object') {
          throw new Error("Nenhuma publicação encontrada");
        }

        // Convert to array and sort by date (newest first)
        const postsArray = Object.values(data).sort((a, b) => {
          return new Date(b.data || 0) - new Date(a.data || 0);
        });

        if (postsArray.length === 0) {
          postsContainer.innerHTML = `
            <div class="no-posts">
              <i class="fas fa-comment-slash" style="font-size: 2rem;"></i>
              <p>Nenhuma publicação encontrada. Seja o primeiro a compartilhar!</p>
            </div>
          `;
          return;
        }

        // Render posts
        postsContainer.innerHTML = '';
        postsArray.forEach(post => {
          const postDate = post.data ? new Date(post.data).toLocaleString() : 'Data desconhecida';
          const postId = post.id || Date.now().toString();

          const postElement = document.createElement('div');
          postElement.className = 'post';
          postElement.setAttribute('data-post-id', postId);
          postElement.onclick = function() {
            saveAndRedirectToPost(post);
          };

          postElement.innerHTML = `
            <div class="post-header">
              ${post.imagemPerfil ? 
                `<img src="${post.imagemPerfil}" class="post-user-pic" alt="${post.nome || 'Usuário'}">` : 
                `<div class="post-user-pic" style="background-color: #333; display: flex; align-items: center; justify-content: center;">
                  <i class="fas fa-user" style="font-size: 1.5rem; color: #888;"></i>
                </div>`
              }
              <div class="post-user-info">
                <div class="post-username">${post.nome || 'Usuário'}</div>
                <div class="post-date"><i class="far fa-clock"></i> ${postDate}</div>
              </div>
            </div>
            <div class="post-content">${post.texto || ''}</div>
            ${post.imagem ? `<img src="${post.imagem}" class="post-image" alt="Imagem da publicação">` : ''}
            <div class="post-actions">
              <div class="post-action"><i class="far fa-comment"></i> Comentar</div>
              <div class="post-action" onclick="event.stopPropagation(); sharePost('${post.nome || 'Usuário'}', '${post.texto || ''}')"><i class="fas fa-share"></i> Compartilhar</div>
            </div>
          `;

          postsContainer.appendChild(postElement);
        });

        // Add animations to posts
        const posts = document.querySelectorAll('.post');
        posts.forEach((post, index) => {
          post.style.animationDelay = `${index * 0.1}s`;
        });

      } catch (error) {
        console.error("Erro ao carregar publicações:", error);
        postsContainer.innerHTML = `
          <div class="message error">
            <i class="fas fa-exclamation-triangle"></i> Erro ao carregar publicações: ${error.message}
          </div>
        `;
      }
    }

    // Save post and redirect to post page
    function saveAndRedirectToPost(post) {
      // Save the post data to localStorage
      localStorage.setItem('currentPost', JSON.stringify(post));

      // Redirect to the post page
      window.location.href = 'post.html?id='+post.id;
    }

    // Share post
    function sharePost(author, text) {
      const shareText = `${author} compartilhou na CM Store: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`;

      if (navigator.share) {
        navigator.share({
          title: 'Publicação da CM Store',
          text: shareText,
          url: window.location.href
        }).catch(err => {
          console.log('Erro ao compartilhar:', err);
          copyToClipboard(shareText);
        });
      } else {
        copyToClipboard(shareText);
      }
    }

    // Copy to clipboard fallback
    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        info('Conteúdo copiado para a área de transferência!', {
          duration: 3000,
          position: 'top-right'
        });
      }).catch(err => {
        console.log('Erro ao copiar:', err);
        prompt('Copie o texto abaixo:', text);
      });
    }

    // Refresh posts
    function refreshPosts() {
      info("Atualizando publicações...", {
        duration: 2000,
        position: "top-right"
      });
      loadPosts();
    }

    // Initialize the page
    document.addEventListener("DOMContentLoaded", function() {
      loadPosts();

      // Add pulse animation to profile section
      const profileSection = document.querySelector('.profile-section');
      profileSection.style.animation = 'pulse 2s infinite';

      setTimeout(() => {
        profileSection.style.animation = '';
      }, 2000);

      // Show welcome message
      if (!localStorage.getItem('welcomeShown')) {
        setTimeout(() => {
          info(`Bem-vindo(a) à comunidade, ${localStorage.getItem('nome') || 'usuário'}! 👋`, {
            duration: 5000,
            position: "top-right"
          });
          localStorage.setItem('welcomeShown', 'true');
        }, 1500);
      }
    });