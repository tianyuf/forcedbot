const prompt = `Write a screenplay in the Keaton Patti "I forced a bot" meme format.

The bot has watched 1,000 hours of Tucker Carlson and writes a script with:
- Simple misunderstandings of Tucker Carlson
- Wrong words and weird combinations
- ALL CAPS character names
- Short lines

150-250 words. 2-3 scenes.

Output JSON:
{
  "intro": "I forced a bot to watch 1,000 hours of Tucker Carlson and asked it to write a script. Here is the first page.",
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

async function test() {
  console.log("Testing Tucker Carlson...\n");

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

    console.log("Raw response:");
    console.log(result);
    console.log("\n---\n");

    const startIdx = result.indexOf('{');
    const endIdx = result.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = result.substring(startIdx, endIdx + 1);
      console.log("JSON string:");
      console.log(jsonStr);
      const json = JSON.parse(jsonStr);
      console.log("\nParsed successfully!");
      console.log(json.intro);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
