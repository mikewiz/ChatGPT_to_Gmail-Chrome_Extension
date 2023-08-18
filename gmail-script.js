// Function to execute when the window is fully loaded
window.onload = function () {
  // Function to execute when the URL hash changes (e.g., navigating within Gmail)
  window.onhashchange = () => {
    // Check if the hash corresponds to an inbox URL
    if (window.location.hash.startsWith("#inbox/")) {
      const spans = document.querySelectorAll("span");
      // Iterate through all span elements on the page
      for (const span of spans) {
        if (span.innerText === "Reply") {
          // Add a click event listener to the Reply button
          span.addEventListener("click", function () {
            const email = document.querySelector(".adn.ads");
            const emailContent = email.textContent.replace(/\n/g, " ");
            // Async function to handle the GPT request and response
            (async function () {
              // Format the email content for GPT's understanding
              const formattedEmailContent =
                "Respond to the most recent email in a comprehensive and professional tone and sign off with my name (Michael Flint) at the end: \n" +
                emailContent;
              // Define the API request
              let url = "https://api.openai.com/v1/chat/completions";
              let apiKey;
              // Retrieve the API key from Chrome storage and then make the API request
              chrome.storage.sync.get(["apiKey"], function (result) {
                apiKey = result.apiKey;
                if (!apiKey) {
                  console.error("API key not found in Chrome storage.");
                  return;
                }
                // Define headers and data
                let headers = {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                };
                let data = {
                  model: "gpt-3.5-turbo",
                  messages: [{ role: "user", content: formattedEmailContent }],
                  max_tokens: 250,
                };
                // Make the API request
                fetch(url, {
                  method: "POST",
                  headers: headers,
                  body: JSON.stringify(data),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    // Handle the GPT response and update the Gmail textbox
                    const gptResponse = data.choices[0].message.content;
                    const gmailTextbox =
                      document.querySelector("[role=textbox]");
                    gmailTextbox.innerText = gptResponse;
                    // Send a message to the background script with the status update
                    chrome.runtime.sendMessage({
                      type: "updateStatus",
                      extensionStatus: "Active",
                      lastEmail: emailContent,
                      lastResponse: gptResponse,
                    });
                  })
                  .catch((error) => {
                    console.error("Error:", error);
                  });
              });
            })();
          });
        }
      }
    }
  };
};
