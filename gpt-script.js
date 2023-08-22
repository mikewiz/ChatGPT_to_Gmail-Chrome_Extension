console.log("Initializing gpt-script.js...");

// Function to get the Gmail username
function getGmailUsername() {
  // Hypothetical method to get the Gmail username
  // This might need adjustment based on the actual Gmail interface
  const userElement = document.querySelector(".gmail-username-element"); // Replace with the actual selector
  return userElement ? userElement.textContent : "@user"; // Default to "@user" if not found
}

chrome.runtime.onMessage.addListener(function (
  emailContent,
  sender,
  sendResponse
) {
  console.log("Received message from Chrome runtime.");

  // Get the Gmail username
  const username = getGmailUsername();

  chrome.storage.sync.get(["prependString"], function (result) {
    const defaultPrependString =
      "Respond to the most recent email in a comprehensive and professional tone and sign off with " +
      username +
      " at the end: \n";
    const prependString = result.prependString || defaultPrependString;
    const formattedEmailContent = prependString + emailContent;

    console.log("Formatted email content for GPT:", formattedEmailContent);

    chrome.runtime.sendMessage(
      { type: "gptRequest", emailContent: formattedEmailContent },
      function (response) {
        if (response.error) {
          console.error(response.error);
          return;
        }

        console.log("GPT response:", response.response);
        // Handle the GPT response as needed
      }
    );

    // Keep the message channel open for asynchronous communication
    console.log("Keeping message channel open for asynchronous communication.");
    return true;
  });
});
