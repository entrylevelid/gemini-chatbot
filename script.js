document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const typingIndicator = document.getElementById("typing-indicator");
    const apiKeyInput = document.getElementById("api-key-input");
    const saveKeyBtn = document.getElementById("save-key-btn");
    const apiKeySection = document.getElementById("api-key-section");

    // --- Inisialisasi State Awal ---
    function initializeChat() {
        addMessage("Halo! Saya adalah Asisten AImu. Silakan masukkan API Key Gemini di atas untuk memulai percakapan.", "bot");
    }

    // --- Penanganan API Key ---
    async function handleSaveApiKey() {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            addMessage("Mohon masukkan API Keymu.", "bot");
            return;
        }

        saveKeyBtn.textContent = 'Memvalidasi...';
        saveKeyBtn.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:5000/set-api-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: apiKey })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Terjadi kesalahan yang tidak diketahui.');
            }
            
            addMessage("API Key berhasil divalidasi. Kamu bisa mulai mengobrol!", "bot");
            apiKeySection.style.display = 'none';
            userInput.disabled = false;
            sendBtn.disabled = false;
            userInput.focus();

        } catch (error) {
            console.error("API Key validation error:", error);
            addMessage(`Gagal memvalidasi API Key: ${error.message}`, "bot");
        } finally {
            saveKeyBtn.textContent = 'Simpan';
            saveKeyBtn.disabled = false;
        }
    }

    // --- Fungsi-fungsi Chat ---
    function addMessage(message, sender) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", sender);
        
        const icon = document.createElement("div");
        icon.classList.add("icon");
        icon.textContent = sender === 'user' ? '🧑' : '🤖';

        const pElement = document.createElement("p");
        pElement.innerHTML = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        messageElement.appendChild(icon);
        messageElement.appendChild(pElement);
        
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async function getBotResponse(message) {
        typingIndicator.style.display = 'flex';
        
        const API_URL = 'http://127.0.0.1:5000/chat';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            addMessage(data.response, "bot");

        } catch (error) {
            console.error("Error:", error);
            addMessage(`Terjadi kesalahan: ${error.message}`, "bot");
        } finally {
             typingIndicator.style.display = 'none';
        }
    }

    function handleSendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        addMessage(message, "user");
        userInput.value = "";
        getBotResponse(message);
    }

    // --- Event Listeners ---
    saveKeyBtn.addEventListener("click", handleSaveApiKey);
    apiKeyInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleSaveApiKey();
        }
    });

    sendBtn.addEventListener("click", handleSendMessage);
    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
    });

    // --- Mulai Aplikasi ---
    initializeChat();
});

