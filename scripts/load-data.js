import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function loadSets() {
  console.log("Loading sets...");

  const setsPath = join(__dirname, "..", "sets", "en.json");
  const setsData = JSON.parse(readFileSync(setsPath, "utf-8"));

  let count = 0;
  for (const set of setsData) {
    await prisma.set.upsert({
      where: { setId: set.id },
      update: {
        name: set.name,
        series: set.series,
        printedTotal: set.printedTotal,
        total: set.total,
        legalities: set.legalities,
        ptcgoCode: set.ptcgoCode || null,
        releaseDate: set.releaseDate,
        updatedAt: set.updatedAt,
        images: set.images,
      },
      create: {
        setId: set.id,
        name: set.name,
        series: set.series,
        printedTotal: set.printedTotal,
        total: set.total,
        legalities: set.legalities,
        ptcgoCode: set.ptcgoCode || null,
        releaseDate: set.releaseDate,
        updatedAt: set.updatedAt,
        images: set.images,
      },
    });
    count++;
    if (count % 10 === 0) {
      console.log(`  Loaded ${count}/${setsData.length} sets...`);
    }
  }

  console.log(`✓ Loaded ${count} sets successfully`);
}

async function loadCards() {
  console.log("Loading cards...");

  const cardsDir = join(__dirname, "..", "cards", "en");
  const cardFiles = readdirSync(cardsDir).filter((f) => f.endsWith(".json"));

  let totalCards = 0;
  let fileCount = 0;

  for (const file of cardFiles) {
    fileCount++;
    const filePath = join(cardsDir, file);
    const cardsData = JSON.parse(readFileSync(filePath, "utf-8"));

    console.log(
      `  [${fileCount}/${cardFiles.length}] Processing ${file} (${cardsData.length} cards)...`
    );

    for (const card of cardsData) {
      // Extract the set ID from the card ID (e.g., "base1-1" -> "base1")
      const setId = card.id.split("-")[0];

      // Find the corresponding set in the database
      const set = await prisma.set.findUnique({
        where: { setId: setId },
      });

      await prisma.card.upsert({
        where: { cardId: card.id },
        update: {
          name: card.name,
          supertype: card.supertype,
          subtypes: card.subtypes || [],
          level: card.level || null,
          hp: card.hp || null,
          types: card.types || [],
          evolvesFrom: card.evolvesFrom || null,
          evolvesTo: card.evolvesTo || [],
          abilities: card.abilities || null,
          attacks: card.attacks || null,
          weaknesses: card.weaknesses || null,
          resistances: card.resistances || null,
          retreatCost: card.retreatCost || [],
          convertedRetreatCost: card.convertedRetreatCost || null,
          number: card.number,
          artist: card.artist || null,
          rarity: card.rarity || null,
          flavorText: card.flavorText || null,
          nationalPokedexNumbers: card.nationalPokedexNumbers || [],
          legalities: card.legalities,
          regulationMark: card.regulationMark || null,
          images: card.images,
          tcgPlayer: card.tcgplayer || null,
          cardmarket: card.cardmarket || null,
          rules: card.rules || [],
          ancientTrait: card.ancientTrait || null,
          setId: set?.id || null,
        },
        create: {
          cardId: card.id,
          name: card.name,
          supertype: card.supertype,
          subtypes: card.subtypes || [],
          level: card.level || null,
          hp: card.hp || null,
          types: card.types || [],
          evolvesFrom: card.evolvesFrom || null,
          evolvesTo: card.evolvesTo || [],
          abilities: card.abilities || null,
          attacks: card.attacks || null,
          weaknesses: card.weaknesses || null,
          resistances: card.resistances || null,
          retreatCost: card.retreatCost || [],
          convertedRetreatCost: card.convertedRetreatCost || null,
          number: card.number,
          artist: card.artist || null,
          rarity: card.rarity || null,
          flavorText: card.flavorText || null,
          nationalPokedexNumbers: card.nationalPokedexNumbers || [],
          legalities: card.legalities,
          regulationMark: card.regulationMark || null,
          images: card.images,
          tcgPlayer: card.tcgplayer || null,
          cardmarket: card.cardmarket || null,
          rules: card.rules || [],
          ancientTrait: card.ancientTrait || null,
          setId: set?.id || null,
        },
      });
      totalCards++;
    }
  }

  console.log(
    `✓ Loaded ${totalCards} cards from ${cardFiles.length} files successfully`
  );
}

async function main() {
  try {
    console.log("Starting data import...\n");

    await loadSets();
    console.log("");
    await loadCards();

    console.log("\n✓ All data loaded successfully!");
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
