// Log a message to indicate the background script has started
console.log("Background script initiated.");

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

// Listener for messages from content or popup scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "updateStatus") {
    // Update the stored status with the new information
    extensionStatus = {
      extensionStatus: message.extensionStatus,
      lastEmail: message.lastEmail,
      lastResponse: message.lastResponse,
    };
  } else if (message.type === "getStatus") {
    // Send the stored status to the popup script
    sendResponse(extensionStatus);
  }
});

// Listener for forwarding email content from Gmail to OpenAI tab
chrome.runtime.onMessage.addListener(function (
  emailContent,
  sender,
  sendResponse
) {
  // Function to forward email content to OpenAI tab
  async function forwardEmailContent() {
    const tabs = await chrome.tabs.query({
      url: "https://chat.openai.com/*",
    });
    if (tabs.length === 0) return null;
    const tab = tabs[0];
    return await chrome.tabs.sendMessage(tab.id, emailContent);
  }

  // Call the forwardEmailContent function and send the response
  forwardEmailContent().then(sendResponse);

  // Keep the message channel open for asynchronous communication
  return true;
});
