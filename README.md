# Pokemon TCG Data Loader

This project loads Pokemon Trading Card Game data into a MongoDB database using Prisma.

## Setup

### 1. Install Dependencies

```bash
yarn install
```

### 3. Generate Prisma Client

```bash
yarn prisma generate
```

### 4. Load Data

Run the data loading script:

```bash
yarn load
```

This will:

- Load all sets from `./sets/en.json`
- Load all cards from `./cards/en/*.json`
- Create relationships between cards and their sets

## Database Schema

### Sets Collection

- `setId` - Unique set identifier (e.g., "base1", "sv1")
- `name` - Set name
- `series` - Series name
- `printedTotal` - Printed total cards
- `total` - Total cards including secret rares
- `legalities` - Legal formats
- `ptcgoCode` - PTCGO/PTCGL code
- `releaseDate` - Release date
- `updatedAt` - Last update timestamp
- `images` - Symbol and logo images

### Cards Collection

- `cardId` - Unique card identifier (e.g., "base1-1")
- `name` - Card name
- `supertype` - Pokemon, Trainer, or Energy
- `subtypes` - Card subtypes
- `hp` - Hit points
- `types` - Energy types
- `attacks` - Attack details
- `abilities` - Ability details
- `weaknesses` - Weakness types and values
- `resistances` - Resistance types and values
- `retreatCost` - Retreat cost
- `number` - Card number in set
- `artist` - Card artist
- `rarity` - Card rarity
- `flavorText` - Flavor text
- `nationalPokedexNumbers` - Pokedex numbers
- `legalities` - Legal formats
- `images` - Card images (small and large)
- `setId` - Reference to the set

## Useful Commands

### Prisma Commands

#### View Database in Prisma Studio

```bash
yarn db:studio
```

#### Reset Database

```bash
yarn db:push -- --force-reset
```

#### Update Schema

After modifying `prisma/schema.prisma`, run:

```bash
yarn db:generate
yarn db:push
```

### Fork Sync Commands

#### First-time setup (add upstream remote)

```bash
yarn sync:setup
```

#### Sync with upstream repository

```bash
yarn sync:upstream
```

This will:

1. Fetch the latest changes from the upstream repository
2. Switch to your main branch
3. Merge the upstream master branch into your main branch

## Data Source

The card and set data is stored in JSON format:

- Sets: `./sets/en.json`
- Cards: `./cards/en/*.json` (organized by set)
