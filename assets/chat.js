autoResize = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = (textarea.scrollHeight) + "px";
}

/**
 * Handles the streaming response from a server.
 * Reads the response body using a reader object and continuously processes the received data until the response is done.
 * Parses the received data as JSON and extracts the `response` property.
 * Logs the message and inserts it into the HTML document.
 * @param {Response} response - The response object received from the server.
 */
async function receive(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    document.getElementsByClassName("AI")[0].innerHTML = document.getElementsByClassName("AI")[0].innerHTML.replace("...", "");

    const insertLetter = async (letter) => {
        return new Promise(resolve => {
            setTimeout(() => {
                document.getElementsByClassName("AI")[0].insertBefore(document.createTextNode(letter), document.getElementsByClassName("AI")[0].querySelector('.blinking'));
                resolve();
            }, Math.random() * 1000);
        });
    };

    while (true) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }

        const message = JSON.parse(decoder.decode(value)).response;

        for (const letter of message) {
            await insertLetter(letter);
        }
    }
}

/**
 * Sends a POST request to a server and handles the streaming response.
 * @param {string} prompt - The prompt to be sent to the server.
 * @returns {Promise<void>} - A Promise that resolves when the streaming response is handled.
 */
async function generate(prompt) {
    try {
        data = {
            model: document.URL.split("/").reverse()[0],
            prompt: prompt,
        };
        const response = await fetch(window.location.protocol + "//" + window.location.host + "/generate", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        if (!response.body || !response.body.getReader) {
            throw new Error("Streaming not supported by the response");
        }

        // Handle the streaming response
        await receive(response);
    } catch (error) {
        console.error("Error:", error);
    }
}

window.addEventListener("load", (el) => {
    window.messages = []
    document.getElementById("send").addEventListener("click", async (evc) => {
        if (document.getElementById("writing").value.split("\n").join("")) {
            message = document.createElement("div");
            message.classList.add("message");
            texta = document.createElement("div");
            texta.classList.add("me");
            prompt = document.getElementById("writing").value;
            texta.innerHTML = prompt.split("\n").join("<br/>");
            document.getElementById("writing").value = '';
            document.getElementById("writing").style.height = "3vh"
            message.appendChild(texta);
            document.getElementById("chat").prepend(message);
            document.getElementById("writing").disabled = true;
            document.getElementById("send").innerHTML = "🛇"
            message = document.createElement("div");
            message.classList.add("message");
            texta = document.createElement("div");
            texta.classList.add("AI");
            texta.innerHTML = "...";
            cursor = document.createElement("span");
            cursor.innerHTML = "|";
            cursor.classList.add("blinking");
            texta.appendChild(cursor);
            message.appendChild(texta);
            document.getElementById("chat").prepend(message);
            await generate(prompt);
            document.getElementsByClassName("blinking")[0].remove()
            document.getElementById("writing").disabled = false;
            document.getElementById("writing").focus();
            document.getElementById("send").innerHTML = "➜";
        }
    })
})