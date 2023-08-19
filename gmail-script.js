// Function to execute when the window is fully loaded
window.onload = function () {
  console.log("Window loaded.");

  // Function to execute when the URL hash changes (e.g., navigating within Gmail)
  window.onhashchange = () => {
    console.log("URL hash changed.");

    // Check if the hash corresponds to an inbox URL
    if (window.location.hash.startsWith("#inbox/")) {
      console.log("Inbox URL detected.");

      const spans = document.querySelectorAll("span");
      // Iterate through all span elements on the page
      for (const span of spans) {
        if (span.innerText === "Reply") {
          console.log("Reply button found.");

          // Add a click event listener to the Reply button
          span.addEventListener("click", function () {
            console.log("Reply button clicked.");

            const email = document.querySelector(".adn.ads");
            const emailContent = email.textContent.replace(/\n/g, " ");
            console.log("Email content retrieved.");

            // Format the email content for GPT's understanding
            const formattedEmailContent =
              "Respond to the most recent email in a comprehensive and professional tone and sign off with my name (Michael Flint) at the end: \n" +
              emailContent;
            console.log("Email content formatted for GPT.");

            chrome.runtime.sendMessage(
              { type: "gptRequest", emailContent: formattedEmailContent },
              function (response) {
                if (response.error) {
                  console.error(response.error);
                  return;
                }

                const gmailTextbox = document.querySelector("[role=textbox]");
                gmailTextbox.innerText = response.response;
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
          });
        }
      }
    }
  };
};
