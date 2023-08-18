// Request the current status from the background script when the popup is opened
chrome.runtime.sendMessage({ type: "getStatus" }, function (response) {
  if (response) {
    document.getElementById("extensionStatus").textContent =
      response.extensionStatus;
    document.getElementById("lastEmail").textContent = response.lastEmail;
    document.getElementById("lastResponse").textContent = response.lastResponse;
  }
});
