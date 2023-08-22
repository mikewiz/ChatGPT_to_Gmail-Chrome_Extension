let username = ""; // Declare at the top of your script

// Fetch the username from Chrome's storage
chrome.storage.sync.get(["username"], function (result) {
  username = result.username || ""; // Use a default value if not found
});

// Function to get the Gmail username from storage
function getGmailUsernameFromStorage(callback) {
  callback(username); // Use the fetched username
}

// Request the current status from the background script when the popup is opened
chrome.runtime.sendMessage({ type: "getStatus" }, function (response) {
  if (response) {
    // Update the extension status, last email, and last GPT response in the popup
    document.getElementById("extensionStatus").textContent =
      response.extensionStatus;
    document.getElementById("lastEmail").textContent = response.lastEmail;
    document.getElementById("lastResponse").textContent = response.lastResponse;
  }
});

// Retrieve and display the obfuscated API key
chrome.storage.sync.get(["obfuscatedApiKey"], function (result) {
  if (result.obfuscatedApiKey) {
    document.getElementById("obfuscatedApiKey").textContent =
      result.obfuscatedApiKey;
  }
});

// Retrieve and display the saved prepend string
chrome.storage.sync.get(["prependString"], function (result) {
  getGmailUsernameFromStorage(function (gmailUsername) {
    const defaultPrependString =
      "Respond to the most recent email in a comprehensive and professional tone and sign off with " +
      gmailUsername +
      " at the end: \n";
    document.getElementById("prependText").value =
      result.prependString || defaultPrependString;
  });
});

// Retrieve and display the persisted "Last Email Processed" & "Last GPT Response"
chrome.storage.sync.get(
  ["lastEmailStored", "lastResponseStored"],
  function (result) {
    if (result.lastEmailStored && result.lastResponseStored) {
      document.getElementById("lastEmail").textContent = result.lastEmailStored;
      document.getElementById("lastResponse").textContent =
        result.lastResponseStored;
    }
  }
);

// Save the edited prepend string
document
  .getElementById("savePrependText")
  .addEventListener("click", function () {
    const editedPrependString = document.getElementById("prependText").value;
    chrome.storage.sync.set(
      { prependString: editedPrependString },
      function () {
        alert("Prepend text saved successfully!");
      }
    );
  });
