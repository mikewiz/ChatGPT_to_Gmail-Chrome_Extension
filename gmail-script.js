console.log("Initializing gmail-script...");

// Fetch the Gmail user's full name
function getGmailUserFullName() {
  console.log("Attempting to fetch Gmail user's full name...");
  const nameElement = document.querySelector(
    "div[aria-label*='Google Account: ']"
  );
  if (nameElement) {
    console.log("Found Gmail user's full name element.");
    return nameElement
      .getAttribute("aria-label")
      .replace("Google Account: ", "");
  } else {
    console.warn(
      "Unable to find Gmail user full name. Gmail might have updated its UI."
    );
    // Send a message to the background script about the error
    chrome.runtime.sendMessage({
      type: "gmailUserNameError",
      error: "Unable to fetch Gmail user's full name.",
    });
    return null;
  }
}

const gmailUserFullName = getGmailUserFullName();
console.log("Gmail user's full name: ", gmailUserFullName);

// Declare signature
let signature = "";

// Function to execute when the window is fully loaded
window.onload = function () {
  console.log("Window loaded.");

  // #1 Wait until the inbox pops up (or until 4 seconds pass)
  console.log("Setting up inbox check interval...");
  const inboxCheckInterval = setInterval(() => {
    if (doesInboxAppearOnPage()) {
      console.log("Inbox detected on page.");
      clearInterval(inboxCheckInterval);
      setupReplyButtonListenerIfNeeded();
    }
  }, 50);
  setTimeout(() => {
    console.log("Inbox check interval cleared after 4 seconds.");
    clearInterval(inboxCheckInterval);
  }, 4000);

  // #2 Call again whenever a hash changes
  window.onhashchange = () => {
    console.log("Hash change detected.");
    setupReplyButtonListenerIfNeeded();
  };

  // #3 Call again whenever the url changes
  window.addEventListener("popstate", function (event) {
    console.log("URL change detected.");
    setupReplyButtonListenerIfNeeded();
  });
};

function doesInboxAppearOnPage() {
  console.log("Checking if inbox appears on page...");
  const spans = document.querySelectorAll("span");
  for (const span of spans) {
    if (span.innerText === "Reply") {
      console.log("Inbox found on page.");
      return true;
    }
  }
  console.log("Inbox not found on page.");
  return false;
}

function setupReplyButtonListenerIfNeeded() {
  console.log("Checking for reply buttons...");
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
      gmailUserFullName +
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
          console.error("Error from background script:", response.error);
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
  console.log("Generating string with", n, "dots...");
  return ".".repeat(n);
}

function countDotsInString(str) {
  console.log("Counting dots in string:", str);
  return str.split(".").length - 1;
}

function getGmailTextboxText() {
  console.log("Retrieving Gmail textbox content...");
  const gmailTextbox = document.querySelector("[role=textbox]");
  if (gmailTextbox) {
    console.log("Gmail textbox content retrieved.");
    return gmailTextbox.innerText;
  } else {
    console.error("Gmail textbox not found.");
    return null;
  }
}

function updateGmailTextboxText(newText) {
  console.log("Updating Gmail textbox content...");
  const gmailTextbox = document.querySelector("[role=textbox]");
  if (gmailTextbox) {
    // Check if the signature hasn't been captured yet and there is some content in the gmailTextbox
    if (signature.length === 0 && gmailTextbox.innerText.trim().length !== 0) {
      signature = gmailTextbox.innerText;
      console.log("Signature captured:", signature);
    }
    gmailTextbox.innerText = newText;
    console.log("Gmail textbox content updated.");
  } else {
    console.error("Gmail textbox not found.");
  }
}

console.log("gmail-script.js initialized.");
