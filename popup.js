/*
 * The 'DOMContentLoaded' event ensures that the JavaScript code only runs after the entire HTML document has been fully loaded.
 * This is crucial when the script interacts with DOM elements, as trying to manipulate elements that haven't been rendered yet will result in errors.
 * By wrapping the code inside this event, we make sure that all elements are accessible, thus avoiding potential issues.
 */
document.addEventListener("DOMContentLoaded", function() {

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
      // Format prepend string to instruct GPT on responding to the latest email
      const defaultPrependString = "Respond to this email threads' most recent email message, while using all previous emails in the thread as contextual aid. Reply as " + gmailUsername + " at the end: \n";
      document.getElementById("prependText").value = result.prependString || defaultPrependString;
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

  // Save the edited Last Email Processed
  document.getElementById("lastEmail").addEventListener("blur", function () {
    const editedLastEmail = document.getElementById("lastEmail").value;
    chrome.storage.sync.set({ lastEmailStored: editedLastEmail }, function () {
      console.log("Last Email Processed saved successfully.");
    });
  });

  // Save the edited Last GPT Response
  document.getElementById("lastResponse").addEventListener("blur", function () {
    const editedLastResponse = document.getElementById("lastResponse").value;
    chrome.storage.sync.set({ lastResponseStored: editedLastResponse }, function () {
      console.log("Last GPT Response saved successfully.");
    });
  });

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
    
  // Toggle Theme Functionality
  document.getElementById("toggleTheme").addEventListener("click", function () {
    const currentTheme = document.getElementById("themeStylesheet").getAttribute("href");
    const newTheme = currentTheme === "styles.css" ? "darkStyles.css" : "styles.css";
    document.getElementById("themeStylesheet").setAttribute("href", newTheme);
  });
  
  // Refresh Status Functionality
  document.getElementById("refreshStatus").addEventListener("click", function () {
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
  });
});