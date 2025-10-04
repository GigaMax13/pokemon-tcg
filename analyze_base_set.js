// Comprehensive Base Set Pokémon analysis with pagination
// Using built-in fetch (Node.js 18+)

async function fetchAllPokemon() {
  const allPokemon = [];
  let offset = 0;
  const limit = 50; // Fetch in batches of 50
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await fetch(
        `http://localhost:3000/cards/set/base1?limit=${limit}&offset=${offset}`
      );
      const result = await response.json();

      const pokemon = result.data.filter(
        (card) => card.supertype === "Pokémon"
      );
      allPokemon.push(...pokemon);

      // Check if we have more pages
      hasMore = result.pagination.hasNext;
      offset += limit;

      console.log(
        `Fetched ${pokemon.length} Pokémon (total: ${allPokemon.length})`
      );
    } catch (error) {
      console.error("Error fetching data:", error.message);
      break;
    }
  }

  return allPokemon;
}

function parseDamage(damage) {
  if (!damage || damage === "") return null;

  // Handle different damage formats
  let cleanDamage = damage;
  if (damage.includes("+")) {
    cleanDamage = damage.split("+")[0];
  } else if (damage.includes("×")) {
    cleanDamage = damage.split("×")[0];
  } else if (damage.includes("?")) {
    return null; // Skip variable damage attacks
  }

  const numDamage = parseInt(cleanDamage);
  return isNaN(numDamage) ? null : numDamage;
}

function parseRetreatCost(retreatCost) {
  if (!retreatCost || !Array.isArray(retreatCost)) return 0;
  return retreatCost.length;
}

function parseAttackCost(attack) {
  if (!attack || !attack.cost || !Array.isArray(attack.cost)) return 0;
  return attack.cost.length;
}

function calculateStats(values) {
  if (values.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };

  const sorted = values.sort((a, b) => a - b);
  const sum = values.reduce((acc, val) => acc + val, 0);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / values.length,
    count: values.length,
  };
}

async function analyzeBaseSet() {
  try {
    console.log("Fetching all Base Set Pokémon...");
    const allPokemon = await fetchAllPokemon();

    console.log(`\nAnalyzing ${allPokemon.length} Pokémon...`);

    const hpValues = [];
    const attackDamageValues = [];
    const attackCostValues = [];
    const retreatCostValues = [];
    let pokemonWithAttacks = 0;
    let totalAttacks = 0;

    allPokemon.forEach((pokemon) => {
      // Collect HP values
      if (pokemon.hp && pokemon.hp !== "") {
        const hp = parseInt(pokemon.hp);
        if (!isNaN(hp)) {
          hpValues.push(hp);
        }
      }

      // Collect retreat cost values
      const retreatCost = parseRetreatCost(pokemon.retreatCost);
      retreatCostValues.push(retreatCost);

      // Collect attack damage and cost values
      if (pokemon.attacks && pokemon.attacks.length > 0) {
        pokemonWithAttacks++;
        pokemon.attacks.forEach((attack) => {
          const damage = parseDamage(attack.damage);
          if (damage !== null) {
            attackDamageValues.push(damage);
            totalAttacks++;
          }

          // Collect attack cost
          const attackCost = parseAttackCost(attack);
          attackCostValues.push(attackCost);
        });
      }
    });

    // Calculate statistics
    const hpStats = calculateStats(hpValues);
    const attackStats = calculateStats(attackDamageValues);
    const attackCostStats = calculateStats(attackCostValues);
    const retreatStats = calculateStats(retreatCostValues);

    // Display results
    console.log("\n" + "=".repeat(50));
    console.log("BASE SET POKÉMON ANALYSIS");
    console.log("=".repeat(50));

    console.log(`\n📊 OVERVIEW:`);
    console.log(`Total Pokémon: ${allPokemon.length}`);
    console.log(`Pokémon with attacks: ${pokemonWithAttacks}`);
    console.log(`Total attacks analyzed: ${totalAttacks}`);

    console.log(`\n❤️  HP STATISTICS:`);
    console.log(`  Min HP: ${hpStats.min}`);
    console.log(`  Max HP: ${hpStats.max}`);
    console.log(`  Avg HP: ${hpStats.avg.toFixed(2)}`);
    console.log(`  Pokémon with HP: ${hpStats.count}`);

    console.log(`\n⚔️  ATTACK DAMAGE STATISTICS:`);
    console.log(`  Min Damage: ${attackStats.min}`);
    console.log(`  Max Damage: ${attackStats.max}`);
    console.log(`  Avg Damage: ${attackStats.avg.toFixed(2)}`);
    console.log(`  Attacks analyzed: ${attackStats.count}`);

    console.log(`\n💎 ATTACK COST STATISTICS:`);
    console.log(`  Min Attack Cost: ${attackCostStats.min}`);
    console.log(`  Max Attack Cost: ${attackCostStats.max}`);
    console.log(`  Avg Attack Cost: ${attackCostStats.avg.toFixed(2)}`);
    console.log(`  Attacks analyzed: ${attackCostStats.count}`);

    console.log(`\n🏃 RETREAT COST STATISTICS:`);
    console.log(`  Min Retreat Cost: ${retreatStats.min}`);
    console.log(`  Max Retreat Cost: ${retreatStats.max}`);
    console.log(`  Avg Retreat Cost: ${retreatStats.avg.toFixed(2)}`);
    console.log(`  Pokémon analyzed: ${retreatStats.count}`);

    console.log("\n" + "=".repeat(50));
  } catch (error) {
    console.error("Error:", error.message);
  }
}

analyzeBaseSet();
