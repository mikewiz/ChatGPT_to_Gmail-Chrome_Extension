console.log("Initializing gpt-script.js...");

chrome.runtime.onMessage.addListener(function (
  emailContent,
  sender,
  sendResponse
) {
  console.log("Received email content from background script:", emailContent);

  // Format the email content for GPT's understanding
  const formattedEmailContent =
    "Respond to the most recent email in a comprehensive and professional tone and sign off with my name (Michael Flint) at the end: \n" +
    emailContent;
  console.log("Formatted email content ready for GPT.");

  // Define the API request
  let url = "https://api.openai.com/v1/chat/completions";
  let apiKey;

  // Retrieve the API key from Chrome storage and then make the API request
  chrome.storage.sync.get(["apiKey"], function (result) {
    apiKey = result.apiKey;
    if (!apiKey) {
      console.error("API key not found in Chrome storage.");
      sendResponse(null); // Send a null response if no API key is found
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
    fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("GPT response:", data.choices[0].message.content);
        sendResponse(data.choices[0].message.content); // Send back the GPT response
      })
      .catch((error) => {
        console.error("Error:", error);
        sendResponse(null); // Send a null response in case of an error
      });
  });

  // Keep the message channel open for asynchronous communication
  return true;
});
