window.onload = function () {
  console.log("Page loaded.");
  window.onhashchange = () => {
    console.log("Hash changed: " + window.location.hash);
    if (window.location.hash.startsWith("#inbox/")) {
      console.log("Inbox hash detected.");
      const spans = document.querySelectorAll("span");

      for (const span of spans) {
        if (span.innerText === "Reply") {
          console.log("Reply button detected.");
          // Doing something with the element.
          span.addEventListener("click", function () {
            console.log("Reply button clicked.");
            const email = document.querySelector(".adn.ads");
            const emailContent = email.textContent.replace(/\n/g, " ");
            console.log("Email content: ", emailContent);
            (async function () {
              console.log("Sending message to GPT service.");
              //   const gptResponse = await chrome.runtime.sendMessage(
              //     emailContent
              //   );

              // Format the email content for GPT's understanding
              const formattedEmailContent =
                "Respond to the most recent email in a comprehensive and professional tone and sign off with my name (Michael Flint) at the end: \n" +
                emailContent;
              console.log("Formatted email content ready for GPT.");

              // Define the API request
              let url = "https://api.openai.com/v1/chat/completions";
              let apiKey;

              // Retrieve the API key from Chrome storage
              chrome.storage.sync.get(["apiKey"], function (result) {
                apiKey = result.apiKey;
                // Rest of your code that uses the apiKey
              });
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
                  console.log("GPT response:", data.choices[0].message.content);
                  gptResponse = data.choices[0].message.content;
                  const gmailTextbox = document.querySelector("[role=textbox]");
                  gmailTextbox.innerText = gptResponse;
                  console.log("Gmail response textbox filled.");

                  // Send back the GPT response
                  //   sendResponse(data.choices[0].message.content);
                })
                .catch((error) => {
                  console.error("Error:", error);
                  //   sendResponse(null);
                });
            })();
          });
        }
      }
    }
  };
};
