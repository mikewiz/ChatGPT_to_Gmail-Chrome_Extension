console.log("Initializing gpt-script.js...");

chrome.runtime.onMessage.addListener(function (
  emailContent,
  sender,
  sendResponse
) {
  // Format the email content for GPT's understanding
  const formattedEmailContent =
    "Respond to the most recent email in a comprehensive and professional tone and sign off with my name (Michael Flint) at the end: \n" +
    emailContent;

  let url = "https://api.openai.com/v1/chat/completions";
  let apiKey;

  // Retrieve the API key from Chrome storage
  chrome.storage.sync.get(["apiKey"], function (result) {
    apiKey = result.apiKey;
    if (!apiKey) {
      console.error("API key not found in Chrome storage.");
      sendResponse(null);
      return;
    }

    let headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    let data = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: formattedEmailContent }],
      max_tokens: 250,
    };

    // Make the API request
    fetch(url, { method: "POST", headers: headers, body: JSON.stringify(data) })
      .then((response) => response.json())
      .then((data) => {
        if (
          data &&
          data.choices &&
          data.choices.length > 0 &&
          data.choices[0].message
        ) {
          sendResponse(data.choices[0].message.content);
        } else {
          console.error("Unexpected GPT response format:", data);
          sendResponse(null);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse(null);
      });
  });

  // Keep the message channel open for asynchronous communication
  return true;
});
