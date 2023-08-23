// Add a click event listener to the save button
document.getElementById("saveButton").addEventListener("click", function () {
  let userInputAPIKey = document.getElementById("apiKeyInput").value;

  if (userInputAPIKey) {
    console.log("Saving user's API key to Chrome's storage...");

    // Save the user's API key to Chrome's storage
    chrome.storage.sync.set(
      {
        apiKey: userInputAPIKey,
        obfuscatedApiKey: "sk-..." + userInputAPIKey.slice(-4), // store the last 4 characters
      },
      function () {
        console.log("API Key saved successfully.");
        alert("API Key has been saved successfully!");

        // Close the tab after 1.5 seconds
        setTimeout(function () {
          console.log("Attempting to close the tab...");
          closeTabWithRetry();
        }, 1500);
      }
    );
  } else {
    console.warn("Invalid or empty API key entered by the user.");
    // Alert the user if the input is empty or invalid
    alert("Please enter a valid API key.");
  }
});

function closeTabWithRetry(retries = 3) {
  try {
    chrome.tabs.getCurrent(function (tab) {
      chrome.tabs.remove(tab.id);
      console.log("Tab closed successfully.");
    });
  } catch (error) {
    console.error("Error encountered while trying to close the tab:", error);
    if (retries > 0) {
      console.log(`Retrying to close the tab. Retries left: ${retries}`);
      setTimeout(() => closeTabWithRetry(retries - 1), 500);
    } else {
      console.error("Failed to close the tab after multiple attempts.");
    }
  }
}
