const http = require("http");
const fs = require("fs");
const path = require("path");
const { getFertilizerById, getFertilizers } = require("./api/fertilizers/repository");

const root = __dirname;
const port = process.env.PORT || 3000;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function serveStatic(requestPath, response) {
  const safePath = path.normalize(requestPath === "/" ? "/index.html" : requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === "/api/fertilizers") {
    sendJson(response, 200, getFertilizers({
      category: url.searchParams.get("category"),
      crop: url.searchParams.get("crop")
    }));
    return;
  }

  if (url.pathname.startsWith("/api/fertilizers/")) {
    const id = decodeURIComponent(url.pathname.replace("/api/fertilizers/", ""));
    const product = getFertilizerById(id);
    sendJson(response, product ? 200 : 404, product || { error: "Fertilizer not found" });
    return;
  }

  serveStatic(url.pathname, response);
});

server.listen(port, () => {
  console.log(`Soilixa site running at http://localhost:${port}`);
});
