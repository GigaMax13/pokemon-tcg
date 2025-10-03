# Pokemon TCG API Server

A Node.js API server that exposes Pokemon Trading Card Game data from MongoDB using Prisma. This server provides read-only endpoints to access sets and cards data.

## Quick Start

### 1. Install Dependencies

```bash
yarn install
```

### 2. Generate Prisma Client

```bash
yarn db:generate
yarn db:push
```

### 3. Load Data

Load the Pokemon TCG data into your MongoDB database:

```bash
yarn load
```

This will:

- Load all sets from `./sets/en.json`
- Load all cards from `./cards/en/*.json`
- Create relationships between cards and their sets

### 4. Start the API Server

```bash
yarn start
```

The server will start on `http://localhost:3000`.

## API Endpoints

### Sets

#### `GET /sets`

List all sets with pagination.

**Query Parameters:**

- `limit` (optional): Number of sets to return (default: 50, max: 200)
- `offset` (optional): Number of sets to skip (default: 0)

**Example:**

```bash
curl "http://localhost:3000/sets?limit=10&offset=0"
```

**Response:**

```json
{
  "data": [
    {
      "id": "...",
      "setId": "sv9",
      "name": "Temporal Forces",
      "series": "Scarlet & Violet",
      "printedTotal": 218,
      "total": 218,
      "legalities": {...},
      "ptcgoCode": "TEF",
      "releaseDate": "2024-03-22",
      "updatedAt": "2024-03-22T00:00:00.000Z",
      "images": {...}
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "size": 10,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### `GET /sets/id/:setId`

Get a specific set by its setId.

**Example:**

```bash
curl "http://localhost:3000/sets/id/base1"
```

#### `GET /sets/code/:ptcgoCode`

Get a specific set by its PTCGO code.

**Example:**

```bash
curl "http://localhost:3000/sets/code/BS"
```

### Cards

#### `GET /cards`

List all cards with pagination and optional search.

**Query Parameters:**

- `limit` (optional): Number of cards to return (default: 50, max: 200)
- `offset` (optional): Number of cards to skip (default: 0)
- `searchName` (optional): Search cards by name (case-insensitive)

**Examples:**

```bash
# List all cards
curl "http://localhost:3000/cards?limit=20"

# Search for Pikachu cards
curl "http://localhost:3000/cards?searchName=pikachu"

# Search with pagination
curl "http://localhost:3000/cards?searchName=charizard&limit=5&offset=0"
```

**Response (for search example):**

```json
{
  "data": [
    {
      "id": "...",
      "cardId": "base1-4",
      "name": "Charizard",
      "supertype": "Pokémon",
      "subtypes": ["Stage 2"],
      "hp": "120",
      "types": ["Fire"],
      "attacks": [...],
      "weaknesses": [...],
      "resistances": [...],
      "retreatCost": ["Colorless", "Colorless", "Colorless"],
      "convertedRetreatCost": 3,
      "number": "4",
      "artist": "Mitsuhiro Arita",
      "rarity": "Rare Holo",
      "flavorText": "Spits fire that is hot enough to melt boulders.",
      "nationalPokedexNumbers": [6],
      "legalities": {...},
      "images": {...},
      "setId": "..."
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "size": 5,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### `GET /cards/id/:cardId`

Get a specific card by its cardId.

**Example:**

```bash
curl "http://localhost:3000/cards/id/base1-1"
```

#### `GET /cards/set/:setId`

Get all cards from a specific set.

**Query Parameters:**

- `limit` (optional): Number of cards to return (default: 50, max: 200)
- `offset` (optional): Number of cards to skip (default: 0)

**Example:**

```bash
curl "http://localhost:3000/cards/set/base1?limit=10"
```

**Response:**

```json
{
  "data": [
    {
      "id": "...",
      "cardId": "base1-1",
      "name": "Alakazam",
      "supertype": "Pokémon",
      "subtypes": ["Stage 2"],
      "hp": "80",
      "types": ["Psychic"],
      "attacks": [...],
      "weaknesses": [...],
      "resistances": [...],
      "retreatCost": ["Colorless", "Colorless", "Colorless"],
      "convertedRetreatCost": 3,
      "number": "1",
      "artist": "Mitsuhiro Arita",
      "rarity": "Rare Holo",
      "flavorText": "Its brain can outperform a supercomputer.",
      "nationalPokedexNumbers": [65],
      "legalities": {...},
      "images": {...},
      "setId": "..."
    }
  ],
  "pagination": {
    "total": 102,
    "page": 1,
    "size": 10,
    "totalPages": 11,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Health Check

#### `GET /health`

Check if the API server is running.

**Example:**

```bash
curl "http://localhost:3000/health"
```

## Response Format

### Paginated Endpoints

Endpoints that return lists (`/sets`, `/cards`, `/cards/set/:setId`) return paginated responses:

```json
{
  "data": [
    {
      "id": "...",
      "setId": "base1",
      "name": "Base Set",
      "series": "Base",
      "printedTotal": 102,
      "total": 102,
      "legalities": {...},
      "ptcgoCode": "BS",
      "releaseDate": "1999-01-09",
      "updatedAt": "2020-08-14T09:35:11.000Z",
      "images": {...}
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "size": 50,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Single Item Endpoints

Endpoints that return single items (`/sets/id/:setId`, `/sets/code/:ptcgoCode`, `/cards/id/:cardId`) return the item directly:

```json
{
  "id": "...",
  "setId": "base1",
  "name": "Base Set",
  "series": "Base",
  "printedTotal": 102,
  "total": 102,
  "legalities": {...},
  "ptcgoCode": "BS",
  "releaseDate": "1999-01-09",
  "updatedAt": "2020-08-14T09:35:11.000Z",
  "images": {...}
}
```

### Error Response

Error responses include an `error` field with a descriptive message:

```json
{
  "error": "Set not found"
}
```

## Database Schema

### Set Fields

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

### Card Fields

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

## Development Commands

### Prisma Commands

```bash
# Generate Prisma client
yarn db:generate

# View database in Prisma Studio
yarn db:studio

# Reset database (WARNING: This will delete all data)
yarn db:push -- --force-reset

# Update schema after modifications
yarn db:generate
yarn db:push
```

### Data Management

```bash
# Load data from JSON files
yarn load

# Sync with upstream Pokemon TCG data repository
yarn sync:upstream
```

## Data Source

The card and set data is sourced from the official Pokemon TCG data repository and stored in JSON format:

- Sets: `./sets/en.json`
- Cards: `./cards/en/*.json` (organized by set)

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `404` - Resource not found
- `500` - Internal server error

All error responses include a JSON object with an `error` field describing the issue.

## CORS

The API includes CORS headers to allow cross-origin requests from web applications.
