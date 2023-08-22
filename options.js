// Function to close the tab with a retry mechanism
function closeTabWithRetry(retryCount = 0) {
  try {
    chrome.tabs.getCurrent(function (tab) {
      chrome.tabs.remove(tab.id);
    });
  } catch (error) {
    if (
      error.message.includes("Tabs cannot be edited right now") &&
      retryCount < 5
    ) {
      setTimeout(() => closeTabWithRetry(retryCount + 1), 500); // Retry after 500ms
    } else {
      console.error("Failed to close tab after multiple attempts:", error);
    }
  }
}

// Add a click event listener to the save button
document.getElementById("saveButton").addEventListener("click", function () {
  let userInputAPIKey = document.getElementById("apiKeyInput").value;

  if (userInputAPIKey) {
    // Save the user's API key to Chrome's storage
    chrome.storage.sync.set(
      {
        apiKey: userInputAPIKey,
        obfuscatedApiKey: "sk-..." + userInputAPIKey.slice(-4), // store the last 4 characters
      },
      function () {
        alert("API Key has been saved successfully!");

        // Close the tab after 1.5 seconds using the retry mechanism
        setTimeout(closeTabWithRetry, 1500);
      }
    );
  } else {
    // Alert the user if the input is empty or invalid
    alert("Please enter a valid API key.");
  }
});
