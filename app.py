import os
import webbrowser
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import threading

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

chat_session = None  


# ============================
# 🧠 ROUTE UTAMA
# ============================
@app.route('/')
def index():
    """Mengembalikan halaman utama chatbot"""
    return send_from_directory('.', 'index.html')


# ============================
# 🔑 SET API KEY
# ============================
@app.route('/set-api-key', methods=['POST'])
def set_api_key():
    global chat_session
    api_key = request.json.get("api_key")

    if not api_key:
        return jsonify({"error": "API Key tidak boleh kosong."}), 400

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        chat_session = model.start_chat(history=[])
        print("✅ Model Gemini berhasil diinisialisasi.")
        return jsonify({"message": "API Key diterima dan model berhasil diinisialisasi."})
    except Exception as e:
        chat_session = None
        print(f"❌ Error saat inisialisasi Gemini: {e}")
        return jsonify({"error": "API Key tidak valid atau terjadi kesalahan pada server."}), 500


# ============================
# 💬 CHAT ENDPOINT
# ============================
@app.route('/chat', methods=['POST'])
def chat():
    global chat_session

    if not chat_session:
        return jsonify({"error": "Harap masukkan API Key yang valid terlebih dahulu."}), 401

    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "Pesan tidak boleh kosong."}), 400

    try:
        response = chat_session.send_message(user_message)
        return jsonify({"response": response.text})
    except Exception as e:
        print(f"❌ Error saat mengirim pesan ke Gemini: {e}")
        return jsonify({"error": "Terjadi kesalahan saat berkomunikasi dengan AI."}), 500


# ============================
# 🌐 SERVE STATIC FILES
# ============================
@app.route('/<path:path>')
def serve_static(path):
    """Menyediakan file static seperti CSS dan JS"""
    return send_from_directory('.', path)


# ============================
# 🚀 AUTO OPEN BROWSER (once)
# ============================
def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000")


if __name__ == '__main__':
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        threading.Timer(1.0, open_browser).start()

    app.run(host='0.0.0.0', port=5000, debug=True)
