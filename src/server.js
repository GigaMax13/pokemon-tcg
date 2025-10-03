import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Helper functions
function parsePagination(req) {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;
  const page = Math.floor(offset / limit) + 1;
  return { limit, offset, page };
}

function createPaginatedResponse(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      size: limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Routes

// GET /sets - List all sets with pagination
app.get("/sets", async (req, res) => {
  try {
    const { limit, offset, page } = parsePagination(req);

    const [sets, total] = await Promise.all([
      prisma.set.findMany({
        skip: offset,
        take: limit,
        orderBy: { releaseDate: "desc" },
      }),
      prisma.set.count(),
    ]);

    res.json(createPaginatedResponse(sets, total, page, limit));
  } catch (error) {
    console.error("Error fetching sets:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /sets/id/:setId - Get set by setId
app.get("/sets/id/:setId", async (req, res) => {
  try {
    const { setId } = req.params;

    const set = await prisma.set.findUnique({
      where: { setId },
    });

    if (!set) {
      return res.status(404).json({ error: "Set not found" });
    }

    res.json(set);
  } catch (error) {
    console.error("Error fetching set by setId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /sets/code/:ptcgoCode - Get set by ptcgoCode
app.get("/sets/code/:ptcgoCode", async (req, res) => {
  try {
    const { ptcgoCode } = req.params;

    const set = await prisma.set.findFirst({
      where: { ptcgoCode },
    });

    if (!set) {
      return res.status(404).json({ error: "Set not found" });
    }

    res.json(set);
  } catch (error) {
    console.error("Error fetching set by ptcgoCode:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /cards - List all cards with pagination and optional search
app.get("/cards", async (req, res) => {
  try {
    const { limit, offset, page } = parsePagination(req);
    const { searchName } = req.query;

    const where = searchName
      ? {
          name: {
            contains: searchName,
            mode: "insensitive",
          },
        }
      : {};

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip: offset,
        take: limit,
      }),
      prisma.card.count({ where }),
    ]);

    res.json(createPaginatedResponse(cards, total, page, limit));
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /cards/id/:cardId - Get card by cardId
app.get("/cards/id/:cardId", async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await prisma.card.findUnique({
      where: { cardId },
    });

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.json(card);
  } catch (error) {
    console.error("Error fetching card by cardId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /cards/set/:setId - Get cards by setId
app.get("/cards/set/:setId", async (req, res) => {
  try {
    const { setId } = req.params;
    const { limit, offset, page } = parsePagination(req);

    // First find the set to get its internal ID
    const set = await prisma.set.findUnique({
      where: { setId },
    });

    if (!set) {
      return res.status(404).json({ error: "Set not found" });
    }

    // Then find cards by the set's internal ID
    const where = { setId: set.id };
    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        skip: offset,
        take: limit,
      }),
      prisma.card.count({ where }),
    ]);

    res.json(createPaginatedResponse(cards, total, page, limit));
  } catch (error) {
    console.error("Error fetching cards by setId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nShutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Pokemon TCG API server running on port ${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET /sets - List all sets`);
  console.log(`   GET /sets/id/:setId - Get set by setId`);
  console.log(`   GET /sets/code/:ptcgoCode - Get set by ptcgoCode`);
  console.log(`   GET /cards - List all cards`);
  console.log(`   GET /cards/id/:cardId - Get card by cardId`);
  console.log(`   GET /cards/set/:setId - Get cards by setId`);
  console.log(`   GET /health - Health check`);
});
