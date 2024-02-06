const USER_API_KEY = "<Deepinfra API key"// Api Key
const MODEL_NAME = "mistralai/Mixtral-8x7B-Instruct-v0.1" // "mistralai/Mixtral-8x7B-Instruct-v0.1" "mistralai/Mixtral-8x7B-Instruct-v0.1"


function highlightWord(word) {
    const walkTheDOM = (node, func) => {
        // Avoid scripts and style elements
        if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
            func(node);
            node = node.firstChild;
            while (node) {
                walkTheDOM(node, func);
                node = node.nextSibling;
            }
        }
    };

    const highlightTextNode = (node) => {
        if (node.nodeType === 3 && node.nodeValue.trim() !== '') { // Node.TEXT_NODE and not just whitespace
            const regex = new RegExp(`(${word})`, 'gi');
            let match;

            while ((match = regex.exec(node.nodeValue)) !== null) {
                const matchedText = match[0];
                const matchStart = match.index;
                const matchEnd = matchStart + matchedText.length;

                const beforeMatch = node.nodeValue.slice(0, matchStart);
                const afterMatch = node.nodeValue.slice(matchEnd);

                const highlightSpan = document.createElement('span');
                highlightSpan.className = 'highlight';
                highlightSpan.textContent = matchedText;

                const afterNode = document.createTextNode(afterMatch);

                const parentNode = node.parentNode;
                parentNode.insertBefore(document.createTextNode(beforeMatch), node);
                parentNode.insertBefore(highlightSpan, node);
                parentNode.insertBefore(afterNode, node);

                parentNode.removeChild(node);

                node = afterNode;
            }
        }
    };

    walkTheDOM(document.body, highlightTextNode);
}


function getAllTextContent() {
    const allChunks = [];
    let currentChunk = '';
    let wordCount = 0;

    console.log("GETTING ALL CONTENT")
    const walkTheDOM = (node, func) => {
        // Avoid scripts and style elements
        if (node.nodeType !== Node.ELEMENT_NODE || (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE')) {
            func(node);
            node = node.firstChild;
            while (node) {
                walkTheDOM(node, func);
                node = node.nextSibling;
            }
        }
    };

    const processTextNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const words = node.nodeValue.trim().split(/\s+/);
            words.forEach(word => {
                // Start a new chunk at paragraph breaks
                if (node.parentNode.tagName === 'P' && wordCount >= 500) {
                    allChunks.push(currentChunk.trim());
                    currentChunk = '';
                    wordCount = 0;
                }
                currentChunk += word + ' ';
                wordCount++;
            });
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') {
            // Add a new line for paragraph breaks
            currentChunk += '\n';
        }
    };

    walkTheDOM(document.body, processTextNode);
    allChunks.push(currentChunk.trim()); // Add the last chunk
    return allChunks;
}

async function processChunks(chunks, userQuery) {
    for (const chunk of chunks) {
        const relevantTextData = await getRelevantText(userQuery, chunk);
        console.log("Received relevant text data:", relevantTextData); // Log for debugging
        highlightSentences(relevantTextData);
    }
}

function highlightSentences(relevantTextData) {
    if (relevantTextData && Array.isArray(relevantTextData.PotentiallyRelevant)) {
        relevantTextData.PotentiallyRelevant.forEach(text => highlightWord(text));
    } else {
        console.log("Potentially Relevant text is not an array or undefined.");
    }

    if (relevantTextData && Array.isArray(relevantTextData.Relevant)) {
        relevantTextData.Relevant.forEach(text => highlightWord(text));
    } else {
        console.log("Relevant text is not an array or undefined.");
    }
}


async function getRelevantText(userQuery, inputText) {
    const API_KEY = USER_API_KEY; // Make sure to use your actual API key
    const systemPrompt =  ""

    const prompt = `# MISSION
Using the user query and the input text, you will highlight sentences of the input text based off semantic relevancy to the user query.

# RESPONSE FORMAT
The response you give must be in the format of a JSON
example response:
"{
    "Relevant": ["relevant example text", "other relevant example text"],
    "PotentiallyRelevant": ["potentially relevant example text", "other potentially relevant example text"]
}"

# AXIOMS
The text that you put into your json response must be exactly the same as the text from the input text

Input Text: "${inputText}"

User Query: "${userQuery}"`;

    // Prepare the body using the user query and the input text content
    const bodyContent = {
        model: MODEL_NAME,
        messages: [{role: "system", content: "Be a helpful assistant"}, {role: "user", content: prompt}],
        max_tokens: 2000
    };

    let content;
    try {
        console.log("Fetching AI response")
        // Send the POST request to the API endpoint
        const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
            method: 'POST',
            body: JSON.stringify(bodyContent),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            }
        });

        // Parse the response as JSON
        const data = await response.json();


        let responseContent = data.choices[0].message.content;
        console.log(responseContent);
        // Handle special characters for JSON string
        responseContent = responseContent.replace(/\\/g, "\\\\");

        const startIndex = responseContent.indexOf('{');
        const endIndex = responseContent.lastIndexOf('}');
        let jsonPart = responseContent.substring(startIndex, endIndex + 1);


        try {
            content = JSON.parse(jsonPart);
            console.log(content); // Log the parsed JSON
            // Process content...
        } catch (error) {
            console.error("Error parsing JSON:", error);
            console.log("Extracted JSON String:", jsonPart); // Log the extracted JSON string
        }

        // Log for debugging
        //console.log(content);

        // Return the relevant sections of the text based on the parsed JSON
        return content;
    } catch (error) {
        // Handle errors, such as network issues or invalid API keys
        console.error("Error fetching relevant text:", error);
    }
}


function highlightString(text) {
    // This is a simple function that creates a regex from the text and wraps it in a span with a highlight class
    const regex = new RegExp(text, "gi");
    document.body.innerHTML = document.body.innerHTML.replace(regex, (match) => `<span class="highlight">${match}</span>`);
}


chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.action === "highlight") {
        const userQuery = request.query;
        const textNodes = getAllTextNodes();

        // Create an array of promises from assessRelevancy calls
        const relevancyPromises = textNodes.map(textNode => assessRelevancy(textNode, userQuery));

        // Use Promise.all to wait for all relevancy assessments to complete
        await Promise.all(relevancyPromises);

        chrome.runtime.sendMessage({ action: "hideLoader" });
        sendResponse({ status: "Text highlighted" });
    }
});



function getAllTextNodes(minLength = 3) {
    const textNodes = [];
    const walkTheDOM = (node) => {
        if (node.nodeType === 3 && node.nodeValue.trim().length >= minLength) { // Node.TEXT_NODE
            textNodes.push(node);
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
            // Iterate through child nodes
            let child = node.firstChild;
            while (child) {
                walkTheDOM(child);
                child = child.nextSibling;
            }
        }
    };

    walkTheDOM(document.body);
    return textNodes;
}

async function assessRelevancy(textNode, userQuery) {
    const API_KEY = USER_API_KEY; // Make sure to use your actual API key
    const inputText = textNode.nodeValue
    console.log("rating: ", inputText);
    const systemPrompt = ""

    const prompt = `Rate this text from 0-5 based off relevancy, suitability and appropriateness to the user's query: "${inputText}"

User query: "${userQuery}"

If the text is not relevant to the query return a value of 0.
Respond ONLY with the integer rating and NOTHING ELSE`;

    // Prepare the body using the user query and the input text content
    const bodyContent = {
        model: MODEL_NAME,
        messages: [{ role: "system", content: "Be a helpful assistant" }, { role: "user", content: prompt }],
        max_tokens: 2
    };

    let rating;
    try {
        console.log("Fetching AI response")
        // Send the POST request to the API endpoint
        const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
            method: 'POST',
            body: JSON.stringify(bodyContent),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            }
        });

        // Parse the response as JSON
        const data = await response.json();

        let responseContent = data.choices[0].message.content;

        rating = parseInt(responseContent.trim())

        console.log("Received rating:", rating);
    }
    catch (error) {
        // Handle errors, such as network issues or invalid API keys
        console.error("Error fetching relevancy rating:", error);
    }

    // Pass the text node and rating to the highlighting function
    highlightTextNode(textNode, rating);
}


function highlightTextNode(textNode, rating) {
    const highlightSpan = document.createElement('span');
    highlightSpan.className = 'highlight-rating-' + rating; // Dynamically set class based on rating
    highlightSpan.textContent = textNode.nodeValue;

    if (textNode.parentNode) {
        textNode.parentNode.replaceChild(highlightSpan, textNode);
    }
}
