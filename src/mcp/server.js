#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
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
      tools: {},
    },
  }
);

// Helper function to fetch from API
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

// Handle tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_sets",
        description: "List all Pokemon TCG sets with pagination",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of results to return",
            },
            offset: {
              type: "number",
              description: "Offset for pagination",
            },
          },
        },
      },
      {
        name: "get_set_by_id",
        description: "Get a specific set by its setId",
        inputSchema: {
          type: "object",
          properties: {
            setId: {
              type: "string",
              description: "The set ID (e.g., 'base1')",
            },
          },
          required: ["setId"],
        },
      },
      {
        name: "get_set_by_code",
        description: "Get a specific set by its PTCGO code",
        inputSchema: {
          type: "object",
          properties: {
            ptcgoCode: {
              type: "string",
              description: "The PTCGO code",
            },
          },
          required: ["ptcgoCode"],
        },
      },
      {
        name: "get_cards",
        description: "List all Pokemon TCG cards with pagination and search",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of results to return",
            },
            offset: {
              type: "number",
              description: "Offset for pagination",
            },
            searchName: {
              type: "string",
              description: "Search for cards by name",
            },
          },
        },
      },
      {
        name: "get_card_by_id",
        description: "Get a specific card by its cardId",
        inputSchema: {
          type: "object",
          properties: {
            cardId: {
              type: "string",
              description: "The card ID",
            },
          },
          required: ["cardId"],
        },
      },
      {
        name: "get_cards_by_set",
        description: "Get all cards from a specific set",
        inputSchema: {
          type: "object",
          properties: {
            setId: {
              type: "string",
              description: "The set ID (e.g., 'base1')",
            },
            limit: {
              type: "number",
              description: "Number of results to return",
            },
            offset: {
              type: "number",
              description: "Offset for pagination",
            },
          },
          required: ["setId"],
        },
      },
    ],
  };
});

// Handle tools/call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let data;

    switch (name) {
      case "get_sets":
        data = await fetchApiData("/sets", args);
        break;

      case "get_set_by_id":
        data = await fetchApiData(`/sets/id/${encodeURIComponent(args.setId)}`);
        break;

      case "get_set_by_code":
        data = await fetchApiData(
          `/sets/code/${encodeURIComponent(args.ptcgoCode)}`
        );
        break;

      case "get_cards":
        data = await fetchApiData("/cards", args);
        break;

      case "get_card_by_id":
        data = await fetchApiData(
          `/cards/id/${encodeURIComponent(args.cardId)}`
        );
        break;

      case "get_cards_by_set":
        const { setId, ...params } = args;
        data = await fetchApiData(
          `/cards/set/${encodeURIComponent(setId)}`,
          params
        );
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Pokemon TCG MCP Server started");
