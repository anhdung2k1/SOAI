export const sendMessageToAPI = async (message, model, collection_name) => {
    try {
        const API_BASE_URL = "https://127.0.0.1"; // Replace with your actual API URL

        const payload = {
            model: model,
            messages: [{ role: "user", content: message }],
            temperature: 0.5,
            collection_name: collection_name
        };

        const response = await fetch(`${API_BASE_URL}/api/v1/chat/completions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botResponse = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode chunk and parse JSON
            const decodedChunk = decoder.decode(value, { stream: true }).trim();
            if (!decodedChunk) continue; // Skip empty responses

            // Some APIs might send multiple JSON objects in one chunk
            const jsonChunks = decodedChunk.split("\n").filter(Boolean);
            for (const jsonChunk of jsonChunks) {
                try {
                    const parsedChunk = JSON.parse(jsonChunk);
                    if (parsedChunk.message?.content) {
                        botResponse += parsedChunk.message.content; // Append content
                    }
                } catch (error) {
                    console.error("Error parsing JSON chunk:", jsonChunk, error);
                }
            }
        }

        return { reply: botResponse.trim() };
    } catch (error) {
        console.error("Streaming API error:", error);
        return { reply: "Sorry, something went wrong. Please try again." };
    }
};
