const webhookURL = process.env.BELLA_WEBHOOK;

export async function sendMessage(message: string) {
    if (webhookURL === undefined || webhookURL.length <10){
        console.error("Missing BELLA_WEBHOOK env variable");
        return;
    }
    const response = await fetch(webhookURL, {
        method: "POST",
        body: JSON.stringify({content: message,}),
        headers: { "Content-Type": "application/json" },
    });
    const result = await response.text();
    console.log(result);
}
