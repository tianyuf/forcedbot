const testInputs = ["Olive Garden commercials", "Tucker Carlson"];

function buildPrompt(content) {
  return `Write a screenplay in the Keaton Patti "I forced a bot" meme format.

The bot has watched 1,000 hours of ${content} and writes a script with:
- Simple misunderstandings of ${content}
- Wrong words and weird combinations
- ALL CAPS character names
- Short lines

150-250 words. 2-3 scenes.

Output JSON:
{
  "intro": "I forced a bot to watch 1,000 hours of ${content} and asked it to write a script. Here is the first page.",
  "scenes": [
    {
      "heading": "INT. LOCATION - TIME",
      "lines": [
        {"type": "action", "text": "Description"},
        {"type": "character", "text": "NAME"},
        {"type": "dialogue", "text": "Line"}
      ]
    }
  ]
}`;
}

async function testGeneration(content) {
  const prompt = buildPrompt(content);
  console.log(`\n=== ${content.toUpperCase()} ===\n`);

  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim();

    if (!result) {
      console.log('No response');
      return;
    }

    const startIdx = result.indexOf('{');
    const endIdx = result.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = result.substring(startIdx, endIdx + 1);
      const json = JSON.parse(jsonStr);

      console.log(json.intro);
      console.log('');

      for (const scene of json.scenes || []) {
        console.log(scene.heading);
        console.log('');
        for (const line of scene.lines || []) {
          if (line.type === 'character') {
            console.log('                    ' + line.text);
          } else if (line.type === 'dialogue') {
            console.log(line.text);
          } else {
            console.log(line.text);
          }
          console.log('');
        }
      }
    } else {
      console.log('Raw:', result.substring(0, 500));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

(async () => {
  for (const input of testInputs) {
    await testGeneration(input);
    console.log('─'.repeat(60));
  }
})();
