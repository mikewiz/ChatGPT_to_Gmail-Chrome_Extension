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
