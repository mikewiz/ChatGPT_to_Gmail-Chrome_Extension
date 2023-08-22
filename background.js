// Log a message to indicate the background script has started
console.log("Background script initiated.");

let username = ""; // Declare at the top of your script

// Fetch the username from Chrome's storage
chrome.storage.sync.get(["username"], function (result) {
  username = result.username || ""; // Use a default value if not found
});

// Check if the API key is set in Chrome's storage
chrome.storage.sync.get(["apiKey"], function (result) {
  if (!result.apiKey) {
    // Notify the user to set the API key if it's not set
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/1/icon16.png", // Path to your extension's icon
      title: "Setup Required",
      message: "Please set your OpenAI API key via the extension options.",
    });
    // Optionally, open the options page for the user
    chrome.runtime.openOptionsPage();
  }
});

// Store the latest status update
let extensionStatus = {
  extensionStatus: "Active",
  lastEmail: "None yet",
  lastResponse: "None yet",
};

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "gptRequest") {
    const formattedEmailContent = message.emailContent;

    let url = "https://api.openai.com/v1/completions";
    let apiKey;

    chrome.storage.sync.get(["apiKey"], function (result) {
      apiKey = result.apiKey;
      if (!apiKey) {
        sendResponse({ error: "API key not found in Chrome storage." });
        return;
      }

      let headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };
      let data = {
        prompt: formattedEmailContent,
        max_tokens: 250,
        model: "text-davinci-003",
      };

      fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
          }
          const gptResponse = data.choices[0].text.trim();
          sendResponse({ response: gptResponse });
        })
        .catch((error) => {
          console.error(error);
          sendResponse({ error: error.message });
        });
    });

    return true; // Keeps the message channel open for asynchronous response
  } else if (message.type === "updateStatus") {
    // Update the stored status with the new information
    extensionStatus = {
      extensionStatus: message.extensionStatus,
      lastEmail: message.lastEmail,
      lastResponse: message.lastResponse,
    };
    sendResponse({ status: "Status updated successfully." });
  } else if (message.type === "getStatus") {
    // Send the stored status to the requester (likely the popup script)
    sendResponse(extensionStatus);
  } else if (message.type === "storeUsername") {
    // Store the received Gmail username in chrome.storage.sync
    chrome.storage.sync.set({ gmailUsername: message.username }, function () {
      console.log("Gmail username stored successfully.");
      sendResponse({ status: "Username stored successfully." });
    });
    return true; // Keeps the message channel open for asynchronous response
  } else {
    // Handle any other message types or errors
    sendResponse({ error: "Unknown message type." });
  }
  return true; // Keeps the message channel open for asynchronous response
});
