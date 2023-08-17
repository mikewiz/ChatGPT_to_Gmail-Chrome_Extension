document.getElementById("saveButton").addEventListener("click", function () {
  let userInputAPIKey = document.getElementById("apiKeyInput").value;

  if (userInputAPIKey) {
    chrome.storage.sync.set({ apiKey: userInputAPIKey }, function () {
      alert("API Key has been saved successfully!");
    });
  } else {
    alert("Please enter a valid API key.");
  }
});
