(function() {
  function createModal(message, inputType) {
    return new Promise((resolve) => {
      const modal = document.createElement("div");
      modal.style.position = "fixed";
      modal.style.top = "0";
      modal.style.left = "0";
      modal.style.width = "100%";
      modal.style.height = "100%";
      modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      modal.style.display = "flex";
      modal.style.justifyContent = "center";
      modal.style.alignItems = "center";
      modal.style.zIndex = "9999";

      const content = document.createElement("div");
      content.style.backgroundColor = "#fff";
      content.style.padding = "20px";
      content.style.borderRadius = "10px";
      content.style.textAlign = "center";
      content.style.width = "80%";
      content.style.maxWidth = "400px";
      content.style.color = "#000"; // Alterado para preto

      const titleEl = document.createElement("h3");
      titleEl.innerText = document.title; // Usando o título do documento
      content.appendChild(titleEl);

      const messageEl = document.createElement("p");
      messageEl.innerText = message;
      content.appendChild(messageEl);

      let inputEl = null;
      if (inputType === "prompt") {
        inputEl = document.createElement("input");
        inputEl.style.width = "80%";
        inputEl.style.margin = "10px 0";
        inputEl.style.padding = "8px";
        inputEl.style.borderRadius = "5px";
        inputEl.style.border = "1px solid #ccc";
        content.appendChild(inputEl);
      }

      const buttonOk = document.createElement("button");
      buttonOk.innerText = "OK";
      buttonOk.style.margin = "10px";
      buttonOk.style.padding = "8px 15px";
      buttonOk.style.backgroundColor = "#007bff";
      buttonOk.style.color = "#fff";
      buttonOk.style.border = "none";
      buttonOk.style.borderRadius = "5px";
      buttonOk.style.cursor = "pointer";
      buttonOk.onclick = function() {
        modal.remove();
        if (inputType === "prompt") {
          resolve(inputEl.value);
        } else {
          resolve(true);
        }
      };
      content.appendChild(buttonOk);

      if (inputType !== "alert") {
        const buttonCancel = document.createElement("button");
        buttonCancel.innerText = "Cancelar";
        buttonCancel.style.margin = "10px";
        buttonCancel.style.padding = "8px 15px";
        buttonCancel.style.backgroundColor = "#dc3545";
        buttonCancel.style.color = "#fff";
        buttonCancel.style.border = "none";
        buttonCancel.style.borderRadius = "5px";
        buttonCancel.style.cursor = "pointer";
        buttonCancel.onclick = function() {
          modal.remove();
          resolve(inputType === "prompt" ? null : false);
        };
        content.appendChild(buttonCancel);
      }

      modal.appendChild(content);
      document.body.appendChild(modal);

      if (inputEl) inputEl.focus();
    });
  }

  window.alert = function(message) {
    return createModal(message, "alert");
  };

  window.confirm = function(message) {
    return createModal(message, "confirm");
  };

  window.prompt = function(message, defaultValue = "") {
    return createModal(message, "prompt").then(result => result || defaultValue);
  };

})();