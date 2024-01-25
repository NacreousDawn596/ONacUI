import flask, requests, json

app = flask.Flask(__name__, template_folder="./")

conversation = []

data = {
    'top_k': 12,
    'top_p': 0.9,
    'temperature': 0.6,
    'repeat_penalty': 1.2,
    'presence_penalty': 1.5,
    'frequency_penalty': 1.0,
    "use_mmap": True,
    'use_mlock': True,
    'embedding_only': True,
    'rope_frequency_base': 1.1,
    'rope_frequency_scale': 0.8,
}

models = [{"name": i['name'], "size": i['details']['parameter_size']} for i in requests.get("http://127.0.0.1:11434/api/tags").json()["models"]]

@app.route("/assets/<path:file>")
def assets(file):
    return flask.send_file(f"./assets/{file}")

@app.route("/")
def index():
    return flask.render_template("index.html", models=models)

@app.route("/chat/<path:model>")
def chat(model):
    conversation.clear()
    return flask.render_template("chat.html", model=model)

@app.route("/generate", methods=['POST'])
def generate():
    global conversation
    data = flask.request.json
    message = []

    def generate_response(data):
        nonlocal message
        response = requests.post("http://localhost:11434/api/generate", json=data, stream=True)
        print(data)
        if response.status_code == 200:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    chunk_str = chunk.decode('utf-8')
                    print(chunk_str)
                    message.append(json.loads(chunk_str)['response'])
                    print(json.loads(chunk_str)['response'])
                    yield f"{chunk_str}"
        else:
            yield "event: error\n"
            yield f"data: {json.dumps({'error': f'Error from external server: {response.status_code}'})}\n\n"

        conversation.append({"role": "user", "content": data.get("prompt")})
        conversation.append({"role": "assistant", "content": ' '.join(message)})
    return flask.Response(generate_response(data), content_type="text/event-stream")

app.run(host="0.0.0.0")
