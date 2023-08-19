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

        // Close the tab after 3 seconds
        setTimeout(function () {
          chrome.tabs.getCurrent(function (tab) {
            chrome.tabs.remove(tab.id);
          });
        }, 3000);
      }
    );
  } else {
    // Alert the user if the input is empty or invalid
    alert("Please enter a valid API key.");
  }
});
