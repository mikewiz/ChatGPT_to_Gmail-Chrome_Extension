// Log a message to indicate the background script has started
console.log("Background script initiated.");

let username = "Michael F. Background"; // Declare at the top of your script

// Store the latest status update
let extensionStatus = {
  extensionStatus: "Active",
  lastEmail: "No emails processed yet.",
  lastResponse: "No GPT responses yet.",
};
console.log("Initial extension status set:", extensionStatus);

// Event listener for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install" || details.reason === "update") {
    console.log(
      "Setting initial values for lastEmailStored and lastResponseStored..."
    );
    chrome.storage.sync.set(
      {
        lastEmailStored: extensionStatus.lastEmail,
        lastResponseStored: extensionStatus.lastResponse,
      },
      function () {
        console.log("Initial values set successfully.");
      }
    );
  }
});

// Fetch the username from Chrome's storage
chrome.storage.sync.get(["username"], function (result) {
  username = result.username || ""; // Use a default value if not found
  console.log("Fetched username from storage:", username);
});

// Check if the API key is set in Chrome's storage
chrome.storage.sync.get(["apiKey"], function (result) {
  if (!result.apiKey) {
    console.warn("API key not found. Notifying user...");
    // Notify the user to set the API key if it's not set
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/1/icon16.png", // Path to your extension's icon
      title: "Setup Required",
      message: "Please set your OpenAI API key via the extension options.",
    });
    // Optionally, open the options page for the user
    chrome.runtime.openOptionsPage();
  } else {
    console.log("API key found in storage.");
  }
});

// Token Fetcher
var tokenFetcher = (function () {
  var clientId =
    "885385555689-40rj42lb2psfatdm1r507srbhaf8rq5m.apps.googleusercontent.com";
  var redirectUri = chrome.identity.getRedirectURL("provider_cb");
  var access_token = null;

  return {
    getToken: function (interactive, callback) {
      if (access_token) {
        callback(null, access_token);
        return;
      }

      var authUrl =
        "https://accounts.google.com/o/oauth2/auth" +
        "?client_id=" +
        clientId +
        "&redirect_uri=" +
        encodeURIComponent(redirectUri) +
        "&response_type=code" +
        "&scope=https://www.googleapis.com/auth/userinfo.profile";

      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: interactive,
        },
        function (redirectUrl) {
          if (chrome.runtime.lastError) {
            callback(new Error(chrome.runtime.lastError));
            return;
          }
          var matches = redirectUrl.split("code=");
          if (matches.length > 1) {
            var authCode = matches[1];
            // You can use the authCode to exchange for an access token
            callback(null, authCode);
          } else {
            callback(new Error("Invalid redirect URI"));
          }
        }
      );
    },

    removeCachedToken: function (token_to_remove) {
      if (access_token == token_to_remove) {
        access_token = null;
        chrome.identity.removeCachedAuthToken(
          { token: token_to_remove },
          function () {
            console.log("Token removed from cache.");
          }
        );
      }
    },
  };
})();

/*
function getUserInfo(token) {
  const xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" +
      token,
    true
  );
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      const user = JSON.parse(xhr.responseText);
      console.log("User Info:", user);
    }
  };
  xhr.send();
}
*/

function getUserInfo(token) {
  fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`)
    .then(response => response.json())
    .then(user => {
      console.log("User Info:", user);
    })
    .catch(error => {
      console.error("Error fetching user info:", error);
    });
}

chrome.identity.getAuthToken({ interactive: true }, function (token) {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError);
    return;
  }
  console.log("Access Token:", token);
  getUserInfo(token);
});

// Listener for messages from content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("Received message:", message.type);
  if (message.type === "gptRequest") {
    const formattedEmailContent = message.emailContent;
    console.log("Formatted email content for GPT:", formattedEmailContent);

    let url = "https://api.openai.com/v1/completions";
    let apiKey;

    chrome.storage.sync.get(["apiKey"], function (result) {
      apiKey = result.apiKey;
      if (!apiKey) {
        console.warn("API key not found in Chrome storage.");
        sendResponse({ error: "API key not found in Chrome storage." });
        return;
      }

      let headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };
      let data = {
        prompt: formattedEmailContent,
        max_tokens: 250,
        model: "text-davinci-003",
      };

      fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Error from OpenAI API:", data.error);
          }
          const gptResponse = data.choices[0].text.trim();
          console.log("Received GPT response:", gptResponse);
          sendResponse({ response: gptResponse });
        })
        .catch((error) => {
          console.error("Error during fetch:", error);
          sendResponse({ error: error.message });
        });
    });

    return true; // Keeps the message channel open for asynchronous response
  } else if (message.type === "updateStatus") {
    // Update the stored status with the new information
    extensionStatus = {
      extensionStatus: message.extensionStatus,
      lastEmail: message.lastEmail,
      lastResponse: message.lastResponse,
    };
    console.log("Updated extension status:", extensionStatus);
    sendResponse({ status: "Status updated successfully." });
  } else if (message.type === "getStatus") {
    // Send the stored status to the requester (likely the popup script)
    console.log("Sending stored extension status:", extensionStatus);
    sendResponse(extensionStatus);
  } else if (message.type === "storeUsername") {
    // Store the received Gmail username in chrome.storage.sync
    console.log("Storing Gmail username:", message.username);
    chrome.storage.sync.set({ gmailUsername: message.username }, function () {
      console.log("Gmail username stored successfully.");
      sendResponse({ status: "Username stored successfully." });
    });
    return true; // Keeps the message channel open for asynchronous response
  } else if (message.type === "gmailUserNameError") {
    console.warn(message.error);
    // Handle the error, e.g., notify the user or log it for debugging.
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/2/icon16.png", // Path to your extension's icon
      title: "Error",
      message: message.error,
    });
  } else {
    // Handle any other message types or errors
    console.warn("Unknown message type received:", message.type);
    sendResponse({ error: "Unknown message type." });
  }

  return true; // Keeps the message channel open for asynchronous response
});
