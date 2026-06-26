import http from "node:http";

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LearnLink Local Preview</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; background: #f7f9fc; color: #17202a; }
    header { position: sticky; top: 0; background: white; border-bottom: 1px solid #d8e0ea; padding: 16px 24px; }
    main { max-width: 1100px; margin: 0 auto; padding: 24px; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 24px; }
    .card { background: white; border: 1px solid #d8e0ea; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .badge { display: inline-block; border-radius: 999px; background: #ecfdf5; color: #0f766e; padding: 4px 10px; font-size: 12px; }
    textarea { width: 100%; min-height: 90px; border: 1px solid #d8e0ea; border-radius: 6px; padding: 10px; }
    button { border: 0; border-radius: 6px; background: #2563eb; color: white; padding: 10px 14px; cursor: pointer; }
    @media (max-width: 800px) { main { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <h1>LearnLink</h1>
    <p>Local preview connected to http://localhost:4000</p>
  </header>
  <main>
    <section>
      <div class="card">
        <label for="post"><strong>Create platform post</strong></label>
        <textarea id="post" placeholder="Write a local test post"></textarea>
        <p><button id="submit">Submit for AI Review</button></p>
      </div>
      <div id="feed"></div>
    </section>
    <aside>
      <div class="card"><strong>Gateway</strong><p id="gateway">Checking...</p></div>
      <div class="card"><strong>Feed source</strong><p id="source">Local backend</p></div>
    </aside>
  </main>
  <script>
    async function loadFeed() {
      const response = await fetch("http://localhost:4000/community/feed/demo-user");
      const data = await response.json();
      document.getElementById("gateway").textContent = "Online";
      document.getElementById("feed").innerHTML = data.posts.map((post) => \`
        <article class="card">
          <h2>\${post.author || post.author_id || "LearnLink user"} <span class="badge">\${post.status || post.ai_moderation_status || "approved"}</span></h2>
          <p><small>\${post.source || post.post_type || "Platform-wide"}</small></p>
          <p>\${post.content}</p>
          <p><small>\${post.metrics || "Live API item"}</small></p>
        </article>\`).join("");
    }

    document.getElementById("submit").addEventListener("click", async () => {
      const content = document.getElementById("post").value.trim();
      if (!content) return;
      await fetch("http://localhost:4000/community/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, author_id: "local-user", post_type: "platform_post" })
      });
      document.getElementById("post").value = "";
      await loadFeed();
    });

    loadFeed().catch(() => {
      document.getElementById("gateway").textContent = "Offline";
      document.getElementById("feed").innerHTML = '<article class="card"><p>Start the backend stack first.</p></article>';
    });
  </script>
</body>
</html>`;

http.createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(html);
}).listen(3000, "127.0.0.1", () => {
  console.log("learnlink local preview listening on http://127.0.0.1:3000");
});

