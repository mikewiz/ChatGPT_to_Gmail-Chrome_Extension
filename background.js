console.log("Background script initiated.");

// Check if the API key is set in Chrome's storage
chrome.storage.sync.get(["apiKey"], function (result) {
  if (!result.apiKey) {
    // Notify the user to set the API key if it's not set
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/1/icon16.png", // Updated path to your extension's icon
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

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "updateStatus") {
    // Update the stored status with the new information
    extensionStatus = {
      extensionStatus: message.extensionStatus,
      lastEmail: message.lastEmail,
      lastResponse: message.lastResponse,
    };
    console.log("Status updated:", extensionStatus);
  } else if (message.type === "getStatus") {
    // Send the stored status to the popup script
    sendResponse(extensionStatus);
  }
});

// Existing code for forwarding email content
chrome.runtime.onMessage.addListener(function (
  emailContent,
  sender,
  sendResponse
) {
  console.log("Message received from Gmail:", emailContent);

  async function forwardEmailContent() {
    try {
      console.log("Searching for chat.openai.com tab...");
      const tabs = await chrome.tabs.query({
        url: "https://chat.openai.com/*",
      });

      if (tabs.length === 0) {
        console.error("OpenAI tab not detected.");
        return null;
      }

      const tab = tabs[0];
      console.log("Forwarding message to OpenAI tab...");
      const gptResponse = await chrome.tabs.sendMessage(tab.id, emailContent);
      console.log("Response from OpenAI:", gptResponse);

      return gptResponse;
    } catch (error) {
      console.error("Background script error:", error);
      return null;
    }
  }

  forwardEmailContent().then(sendResponse);
  return true;
});
