// Add a click event listener to the save button
document.getElementById("saveButton").addEventListener("click", function () {
  let userInputAPIKey = document.getElementById("apiKeyInput").value;

  if (userInputAPIKey) {
    // Save the user's API key to Chrome's storage
    chrome.storage.sync.set({ apiKey: userInputAPIKey }, function () {
      alert("API Key has been saved successfully!");
    });
  } else {
    // Alert the user if the input is empty or invalid
    alert("Please enter a valid API key.");
  }
});
