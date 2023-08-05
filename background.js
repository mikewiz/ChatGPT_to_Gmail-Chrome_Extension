console.log('Background script initiated.');

chrome.runtime.onMessage.addListener(
    function(emailContent, sender, sendResponse) {
        console.log('Message received from Gmail:', emailContent);

        async function forwardEmailContent() {
            try {
                console.log('Searching for chat.openai.com tab...');
                const tabs = await chrome.tabs.query({url: 'https://chat.openai.com/*'});

                if (tabs.length === 0) {
                    console.error('OpenAI tab not detected.');
                    return null;
                }

                const tab = tabs[0];
                console.log('Forwarding message to OpenAI tab...');
                const gptResponse = await chrome.tabs.sendMessage(tab.id, emailContent);
                console.log('Response from OpenAI:', gptResponse);

                return gptResponse;
            } catch (error) {
                console.error('Background script error:', error);
                return null;
            }
        }

        forwardEmailContent().then(sendResponse);
        return true;
    }
);
