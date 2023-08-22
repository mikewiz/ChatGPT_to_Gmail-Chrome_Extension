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
}

function setupReplyButtonListenerIfNeeded() {
  const spans = document.querySelectorAll("span");
  // Iterate through all span elements on the page
  for (const span of spans) {
    if (span.innerText === "Reply") {
      console.log("Reply button found.");

      // Add a click event listener to the Reply button
      span.addEventListener("click", function () {
        console.log("Reply button clicked.");

        const email = document.querySelector(".adn.ads");
        if (email) {
          const emailContent = email.textContent.replace(/\n/g, " ");
          console.log("Email content retrieved.");

          // Format the email content for GPT's understanding
          const formattedEmailContent =
            "Respond to the most recent email in a comprehensive and professional tone and sign off with my name (Michael Flint) at the end: \n" +
            emailContent;
          console.log("Email content formatted for GPT.");

          const loadingIndicationInterval = setInterval(() => {
            const numDots = countDotsInString(getGmailTextboxText());
            const newDotsCount = numDots < 5 ? numDots + 1 : 0;
            updateGmailTextboxText(
              `Loading${getStringWithNumDots(newDotsCount)}`
            );
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
                lastEmail: emailContent,
                lastResponse: response.response,
              });
              console.log("Status message sent to background script.");
            }
          );
        } else {
          console.error("Email content not found.");
        }
      });
    }
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
  return gmailTextbox.innerText;
}

function updateGmailTextboxText(newText) {
  const gmailTextbox = document.querySelector("[role=textbox]");
  gmailTextbox.innerText = newText;
}
