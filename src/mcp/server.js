import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.POKEMON_TCG_API_URL || "http://localhost:3000";

// Create an MCP server
const server = new Server(
  {
    name: "pokemon-tcg-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
    },
  }
);

// Define available resources
const resources = [
  {
    uri: "pokemon-tcg://sets",
    name: "Sets (paginated)",
    mimeType: "application/json",
    description: "List all Pokemon TCG sets with pagination",
  },
  {
    uri: "pokemon-tcg://sets/id/{setId}",
    name: "Set by setId",
    mimeType: "application/json",
    description: "Get a specific set by its setId",
  },
  {
    uri: "pokemon-tcg://sets/code/{ptcgoCode}",
    name: "Set by ptcgoCode",
    mimeType: "application/json",
    description: "Get a specific set by its PTCGO code",
  },
  {
    uri: "pokemon-tcg://cards",
    name: "Cards (paginated/search)",
    mimeType: "application/json",
    description: "List all Pokemon TCG cards with pagination and search",
  },
  {
    uri: "pokemon-tcg://cards/id/{cardId}",
    name: "Card by cardId",
    mimeType: "application/json",
    description: "Get a specific card by its cardId",
  },
  {
    uri: "pokemon-tcg://cards/set/{setId}",
    name: "Cards by setId",
    mimeType: "application/json",
    description: "Get all cards from a specific set",
  },
];

// Helper function to fetch from API and return JSON response
async function fetchApiData(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  }
  return await resp.json();
}

// Handle resources/list requests
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: resources,
  };
});

// Handle resources/read requests
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const u = new URL(uri);
  const path = u.pathname;
  const q = u.searchParams;

  try {
    // Route to API based on URI
    if (u.hostname === "sets" && (path === "/" || path === "")) {
      const params = {};
      if (q.has("limit")) params.limit = q.get("limit");
      if (q.has("offset")) params.offset = q.get("offset");
      const data = await fetchApiData("/sets", params);
      return {
        contents: [
          {
            uri: uri,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (u.hostname === "sets" && path.startsWith("/id/")) {
      const setId = path.split("/")[2];
      const data = await fetchApiData(`/sets/id/${encodeURIComponent(setId)}`);
      return {
        contents: [
          {
            uri: uri,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (u.hostname === "sets" && path.startsWith("/code/")) {
      const ptcgoCode = path.split("/")[2];
      const data = await fetchApiData(
        `/sets/code/${encodeURIComponent(ptcgoCode)}`
      );
      return {
        contents: [
          {
            uri: uri,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (u.hostname === "cards" && (path === "/" || path === "")) {
      const params = {};
      ["limit", "offset", "searchName"].forEach((k) => {
        if (q.has(k)) params[k] = q.get(k);
      });
      const data = await fetchApiData("/cards", params);
      return {
        contents: [
          {
            uri: uri,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (u.hostname === "cards" && path.startsWith("/id/")) {
      const cardId = path.split("/")[2];
      const data = await fetchApiData(
        `/cards/id/${encodeURIComponent(cardId)}`
      );
      return {
        contents: [
          {
            uri: uri,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    if (u.hostname === "cards" && path.startsWith("/set/")) {
      const setId = path.split("/")[2];
      const params = {};
      ["limit", "offset"].forEach((k) => {
        if (q.has(k)) params[k] = q.get(k);
      });
      const data = await fetchApiData(
        `/cards/set/${encodeURIComponent(setId)}`,
        params
      );
      return {
        contents: [
          {
            uri: uri,
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  } catch (error) {
    console.error(`Error fetching resource ${uri}:`, error.message);
    throw error;
  }
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Pokemon TCG MCP Server started");
