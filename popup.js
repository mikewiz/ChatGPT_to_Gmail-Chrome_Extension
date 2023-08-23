console.log("Initializing popup.js...");

let username = "Michael F. Popup"; // Declare at the top of your script

// Fetch the username from Chrome's storage
chrome.storage.sync.get(["username"], function (result) {
  username = result.username || ""; // Use a default value if not found
  console.log("Fetched username from storage:", username);
});

// Function to get the Gmail username from storage
function getGmailUsernameFromStorage(callback) {
  console.log("Fetching Gmail username from storage...");
  callback(username); // Use the fetched username
}

// Request the current status from the background script when the popup is opened
chrome.runtime.sendMessage({ type: "getStatus" }, function (response) {
  if (response) {
    console.log("Received status from background script:", response);
    // Update the extension status, last email, and last GPT response in the popup
    document.getElementById("extensionStatus").textContent =
      response.extensionStatus;
    document.getElementById("lastEmail").textContent = response.lastEmail;
    document.getElementById("lastResponse").textContent = response.lastResponse;
  } else {
    console.warn("No response received from background script.");
  }
});

// Retrieve and display the obfuscated API key
chrome.storage.sync.get(["obfuscatedApiKey"], function (result) {
  if (result.obfuscatedApiKey) {
    console.log("Displaying obfuscated API key:", result.obfuscatedApiKey);
    document.getElementById("obfuscatedApiKey").textContent =
      result.obfuscatedApiKey;
  } else {
    console.warn("Obfuscated API key not found in storage.");
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
    console.log("Displayed prepend string:", result.prependString);
  });
});

// Retrieve and display the persisted "Last Email Processed" & "Last GPT Response"
chrome.storage.sync.get(
  ["lastEmailStored", "lastResponseStored"],
  function (result) {
    if (result.lastEmailStored && result.lastResponseStored) {
      console.log("Displaying last email and response from storage.");
      document.getElementById("lastEmail").textContent = result.lastEmailStored;
      document.getElementById("lastResponse").textContent =
        result.lastResponseStored;
    } else {
      console.warn("Last email or response not found in storage.");
      // Set default values if not found in storage
      document.getElementById("lastEmail").textContent =
        "No emails processed yet.";
      document.getElementById("lastResponse").textContent =
        "No GPT responses yet.";
    }
  }
);

// Save the edited prepend string
document
  .getElementById("savePrependText")
  .addEventListener("click", function () {
    const editedPrependString = document.getElementById("prependText").value;
    console.log("Saving edited prepend string:", editedPrependString);
    chrome.storage.sync.set(
      { prependString: editedPrependString },
      function () {
        console.log("Prepend text saved successfully.");
        alert("Prepend text saved successfully!");
      }
    );
  });
