import { GoogleGenAI } from "@google/genai";
import "./style.css";

const root = document.querySelector("#root");

root.innerHTML = `
  <main class="app">
    <header>
      <div class="logo">🎨 ComicCraft</div>
      <p>AI Comic Story Creator using Gemini</p>
    </header>

    <section class="card">
      <h1>Create Your Comic</h1>
      <p class="muted">Enter an idea and let Gemini turn it into a short comic script.</p>

      <label>Comic idea</label>
      <textarea id="idea" placeholder="Example: A student discovers a friendly robot in college..."></textarea>

      <div class="row">
        <div>
          <label>Genre</label>
          <select id="genre">
            <option>Adventure</option>
            <option>Comedy</option>
            <option>Fantasy</option>
            <option>Science Fiction</option>
            <option>Mystery</option>
            <option>Superhero</option>
          </select>
        </div>
        <div>
          <label>Number of panels</label>
          <select id="panels">
            <option>4</option>
            <option>6</option>
            <option>8</option>
          </select>
        </div>
      </div>

      <label>Gemini API key</label>
      <input id="apiKey" type="password" placeholder="Paste your Gemini API key" />
      <p class="warning">For a college demo only. Do not publish or share your API key.</p>

      <button id="generate">✨ Generate Comic Story</button>
      <p id="status"></p>
    </section>

    <section id="result" class="result"></section>
  </main>
`;

const $ = (id) => document.getElementById(id);

$("generate").addEventListener("click", async () => {
  const idea = $("idea").value.trim();
  const apiKey = $("apiKey").value.trim();
  const genre = $("genre").value;
  const panels = $("panels").value;

  if (!idea || !apiKey) {
    $("status").textContent = "Please enter a comic idea and Gemini API key.";
    return;
  }

  $("generate").disabled = true;
  $("status").textContent = "Creating your comic...";
  $("result").innerHTML = "";

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Create a ${panels}-panel ${genre} comic from this idea:
"${idea}"

Return ONLY valid JSON in this format:
{
  "title": "comic title",
  "characters": ["character 1", "character 2"],
  "panels": [
    {
      "scene": "short visual scene description",
      "caption": "caption or narration",
      "dialogue": "short dialogue"
    }
  ]
}
Keep the language simple and suitable for a college project demo.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    let text = response.text.trim();
    text = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const comic = JSON.parse(text);

    renderComic(comic);
    $("status").textContent = "Comic generated successfully!";
  } catch (error) {
    console.error(error);
    $("status").textContent =
      "Could not generate the comic. Check your API key and internet connection.";
  } finally {
    $("generate").disabled = false;
  }
});

function renderComic(comic) {
  $("result").innerHTML = `
    <div class="comic-header">
      <h2>${escapeHtml(comic.title || "My Comic")}</h2>
      <p><strong>Characters:</strong> ${(comic.characters || []).map(escapeHtml).join(", ")}</p>
    </div>
    <div class="grid">
      ${(comic.panels || []).map((panel, i) => `
        <article class="panel">
          <div class="panel-number">Panel ${i + 1}</div>
          <div class="art">${escapeHtml(panel.scene || "")}</div>
          <p class="caption">${escapeHtml(panel.caption || "")}</p>
          <div class="speech">${escapeHtml(panel.dialogue || "")}</div>
        </article>
      `).join("")}
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
