// Declare username and signature
let username = "";
let signature = "";

// Fetch the username from Chrome's storage
chrome.storage.sync.get(["username"], function (result) {
  username = result.username || ""; // Use a default value if not found
  console.log("Fetched username:", username);
});

// Function to execute when the window is fully loaded
window.onload = function () {
  console.log("Window loaded.");

  // #1 Wait until the inbox pops up (or until 4 seconds pass)
  const inboxCheckInterval = setInterval(() => {
    if (doesInboxAppearOnPage()) {
      clearInterval(inboxCheckInterval);
      setupReplyButtonListenerIfNeeded();
    }
  }, 50);
  setTimeout(() => {
    clearInterval(inboxCheckInterval);
  }, 4000);

  // #2 Call again whenever a hash changes
  window.onhashchange = () => {
    setupReplyButtonListenerIfNeeded();
  };

  // #3 Call again whenever the url changes
  window.addEventListener("popstate", function (event) {
    setupReplyButtonListenerIfNeeded();
  });
};

function doesInboxAppearOnPage() {
  const spans = document.querySelectorAll("span");
  for (const span of spans) {
    if (span.innerText === "Reply") {
      return true;
    }
  }
  return false;
}

function setupReplyButtonListenerIfNeeded() {
  const spans = document.querySelectorAll("span");
  // Iterate through all span elements on the page
  for (const span of spans) {
    if (span.innerText === "Reply") {
      console.log("Reply button found.");

      // Cloning to get rid of event listeners
      let clonedSpan = span.cloneNode(true);
      span.parentNode.replaceChild(clonedSpan, span);

      // Add a click event listener to the Reply button
      clonedSpan.addEventListener("click", replyClickedFunction);
    }
  }
}

function replyClickedFunction() {
  console.log("Reply button clicked.");

  const email = document.querySelector(".adn.ads");
  if (email) {
    const emailContent = email.textContent.replace(/\n/g, " ");
    console.log("Email content retrieved.");

    // Format the email content for GPT's understanding
    const formattedEmailContent =
      "Respond to the most recent email in a comprehensive and professional tone and sign off with " +
      username +
      " at the end: \n" +
      emailContent;
    console.log("Email content formatted for GPT:  " + formattedEmailContent);

    const loadingIndicationInterval = setInterval(() => {
      const numDots = countDotsInString(getGmailTextboxText());
      const newDotsCount = numDots < 5 ? numDots + 1 : 0;
      updateGmailTextboxText(`Loading${getStringWithNumDots(newDotsCount)}`);
    }, 200);

    chrome.runtime.sendMessage(
      { type: "gptRequest", emailContent: formattedEmailContent },
      function (response) {
        clearInterval(loadingIndicationInterval);
        if (response.error) {
          console.error(response.error);
          return;
        }

        updateGmailTextboxText(response.response);
        console.log("Gmail textbox updated with GPT response.");

        // Send a message to the background script with the status update
        chrome.runtime.sendMessage({
          type: "updateStatus",
          extensionStatus: "Active",
          lastEmail: formattedEmailContent,
          lastResponse: response.response,
        });
        console.log("Status message sent to background script.");

        // Store the last email and response in chrome storage
        chrome.storage.sync.set({
          lastEmailStored: emailContent,
          lastResponseStored: response.response,
        });
      }
    );
  } else {
    console.error("Email content not found.");
  }
}

function getStringWithNumDots(n) {
  return ".".repeat(n);
}

function countDotsInString(str) {
  return str.split(".").length - 1;
}

function getGmailTextboxText() {
  const gmailTextbox = document.querySelector("[role=textbox]");
  return gmailTextbox ? gmailTextbox.innerText : null;
}

function updateGmailTextboxText(newText) {
  const gmailTextbox = document.querySelector("[role=textbox]");
  if (gmailTextbox) {
    // Check if the signature hasn't been captured yet and there is some content in the gmailTextbox
    if (signature.length === 0 && gmailTextbox.innerText.trim().length !== 0) {
      signature = gmailTextbox.innerText;
    }
    gmailTextbox.innerText = newText;
  } else {
    console.error("Gmail textbox not found.");
  }
}
