# Semantic-Text-Highlighter-Chrome-Extension
Highlights text on webpages based on relevancy to a user query

This extension uses the [Mixtral 8x7b hosted by Deepinfra](https://deepinfra.com/mistralai/Mixtral-8x7B-Instruct-v0.1) to rank chunks of text on webpages from 0-5 based on relevancy to the user query. More relevant text is highlighted in a green while less relevant text is highlighted orange.
The idea is to help users skim webpages by highlighting stuff relevant to what they are looking for.

Here is an example use on an article about the generative Ai controversy in Palworld ([link](https://www.videogameschronicle.com/news/palworld-embroiled-in-ai-and-pokemon-plagiarism-controversy/))

User query in extension:

![Example Query](https://media.discordapp.net/attachments/535194676077002783/1204418975824351232/image.png?ex=65d4a994&is=65c23494&hm=cfb5faae31549322bf854bf7065527c0e77eddbc81a812518a386f7405cbb640&=&format=webp&quality=lossless&width=526&height=171)

Result:

![Example Result](https://media.discordapp.net/attachments/665217020274671629/1202247240866078730/image.png?ex=65ccc2fe&is=65ba4dfe&hm=0b70325870158e9a4291d30593a2f4d0cae2b29ba2bb049b6da8c2938378c25e&=&format=webp&quality=lossless&width=754&height=889)


# Installation

1. Clone the repository.
2. Go into content.js and change the USER_API_KEY to your Deepinfra API key. (Login to get one [here](https://deepinfra.com/login?from=%2Fdash))
3. Go to [chrome://extensions](chrome://extensions) and enable developer mode.
4. click on 'Load unpacked' and select the Chrome Extension folder in the local repository
5. Go to keyboard shortcuts ([chrome://extensions/shortcuts](chrome://extensions/shortcuts) and edit the 'Activate the extension' shortcut. (Recommended: Ctrl + Shift + F)
6. Optionally, pin the extension so you can click it.


# Usage

1. To use the extension click on the extension in your browser or press the activation shortcut to bring up the pop up.
2. Type in your query or topic you want to find relevant text for. For stricter results try using key words like 'explicitly'.
3. Press enter and the extension will begin highlighting parts of the webpage.

Currently once it has highlighted the page there is no way to remove the highlighting without refreshing the page. Running the extension again will highlight over what was there previously.

