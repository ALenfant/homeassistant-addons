import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createConnection, createLongLivedTokenAuth } from "home-assistant-js-websocket";
import { hassUrl, hassToken, isAddOn } from "./const.js";
import { loadDevicesConfig } from "./devices.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Fetch Home Assistant data via WebSocket and REST API
 * @returns {Promise<Object>} The Home Assistant data
 */
async function fetchHomeAssistantData(accessToken) {
  try {
    const auth = createLongLivedTokenAuth(hassUrl, accessToken);
    const connection = await createConnection({ auth });

    // Fetch themes and network URLs via WebSocket
    const [themesResult, networkResult] = await Promise.all([
      connection.sendMessagePromise({
        type: "frontend/get_themes",
      }),
      connection.sendMessagePromise({
        type: "network/url",
      }),
    ]);

    connection.close();

    // Fetch config via REST API to get language
    const configResponse = await fetch(`${hassUrl}/api/config`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const config = configResponse.ok ? await configResponse.json() : null;

    return {
      ok: Boolean(themesResult && networkResult && config),
      themes: themesResult,
      network: networkResult,
      config: config,
    };
  } catch (err) {
    console.error("Error fetching Home Assistant data:", err);
    return {
      ok: false,
      error: "Cannot connect to Home Assistant",
      themes: null,
      network: null,
      config: null,
    };
  }
}

/**
 * Handle UI page request
 * @param {http.ServerResponse} response - The HTTP response object
 */
export async function handleUIRequest(response) {
  try {
    const devicesData = loadDevicesConfig();

    // Successfully fetched data, serve normal UI
    const htmlPath = join(__dirname, "html", "index.html");
    let html = await readFile(htmlPath, "utf-8");

    // Inject configuration and device data into the HTML (pretty formatted)
    const hassScriptTag = `<script>window.hass = null;</script>`;
    const addonOptionsScriptTag = `<script>window.addonOptions = ${JSON.stringify({ hassUrl, access_token: hassToken || "", isAddOn }, null, 2)};</script>`;
    const devicesScriptTag = `<script>window.devices = ${JSON.stringify(devicesData, null, 2)};</script>`;
    html = html.replace("</head>", `${hassScriptTag}\n  ${addonOptionsScriptTag}\n  ${devicesScriptTag}\n  </head>`);

    response.writeHead(200, {
      "Content-Type": "text/html",
      "Content-Length": Buffer.byteLength(html),
    });
    response.end(html);
  } catch (err) {
    console.error("Error serving UI:", err);
    response.statusCode = 500;
    response.end("Error loading UI");
  }
}

/**
 * Handle Home Assistant metadata request.
 * @param {http.IncomingMessage} request - The HTTP request object
 * @param {http.ServerResponse} response - The HTTP response object
 */
export async function handleHassDataRequest(request, response) {
  const requestUrl = new URL(request.url, "http://localhost");
  const accessToken = requestUrl.searchParams.get("access_token");

  if (!accessToken) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: false, error: "Missing access_token" }));
    return;
  }

  const hassData = await fetchHomeAssistantData(accessToken);
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(hassData));
}
