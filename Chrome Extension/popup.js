document.getElementById('highlight-button').addEventListener('click', function () {
    const userQuery = document.getElementById('text-to-highlight').value; // Get the input text from the extension

    if (userQuery) {
        document.getElementById('loader').style.display = 'block';
        // Send a message to the content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "highlight", query: userQuery }, function (response) {
                // Hide loader after receiving the response
                //document.getElementById('loader').style.display = 'none';
            });
        });
    }
});


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('text-to-highlight').focus();
});

document.getElementById('text-to-highlight').addEventListener('keypress', function (event) {
    if (event.key === 'Enter' && document.activeElement === this) {
        const userQuery = this.value; // Get the input text from the extension

        if (userQuery) {
            document.getElementById('loader').style.display = 'block';
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "highlight", query: userQuery }, function (response) {
                    // Hide loader after receiving the response
                    //document.getElementById('loader').style.display = 'none';
                });
            });
        }

        this.blur(); // Unfocus the text box
        event.preventDefault(); // Prevent the default action
    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "hideLoader") {
        document.getElementById('loader').style.display = 'none';
    }
});
