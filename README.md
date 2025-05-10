# Echelon - Cyberpunk Security Intelligence Dashboard

A futuristic threat intelligence system that pulls real-world cybersecurity data, analyzes it with a machine learning model, and predicts things like which APT group might strike next and how they might do it.

![Echelon](https://github.com/m-kelly444/echelon/blob/main/public/screenshot.png)

## Features

- Real-time threat intelligence from AlienVault OTX and AbuseIPDB APIs
- Machine learning prediction engine for APT group activity analysis
- Cyberpunk-inspired terminal UI with glitch effects
- Full authentication system with protected routes
- PostgreSQL database with Drizzle ORM
- Deployed on Vercel with Neon Database

## Tech Stack

- Next.js 15 App Router
- React 19
- TailwindCSS
- Radix UI
- BetterAuth
- Drizzle ORM
- TensorFlow.js
- Neon PostgreSQL
- Vercel

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm
- Neon PostgreSQL account (or any PostgreSQL instance)
- AlienVault OTX API key
- AbuseIPDB API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/m-kelly444/echelon.git
cd echelon
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory with the following variables:

```
# Database
DATABASE_URL=your_neon_postgres_connection_string

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret

# API Keys
OTX_API_KEY=your_otx_api_key
ABUSEIPDB_API_KEY=your_abuseipdb_api_key
```

4. Push database schema:

```bash
pnpm db:push
```

5. Run the development server:

```bash
pnpm dev
```

6. Access the application at [http://localhost:3000](http://localhost:3000)

## Deployment

The application is configured for easy deployment to Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Set up the environment variables in Vercel dashboard
4. Deploy

## Model Training

The machine learning model can be trained or fine-tuned with new threat data:

1. Collect threat data from APIs or your own sources
2. Preprocess the data using the utilities in `lib/ml/preprocess.ts`
3. Train the model using the functions in `lib/ml/model.ts`
4. Export the model to TensorFlow.js format
5. Save the model files in the `public/models/threat_prediction/` directory

## Project Structure

```
echelon/
├── app/                             # Next.js App Router
│   ├── api/                         # API routes
│   ├── dashboard/                   # Dashboard page
│   ├── intel/                       # Intelligence page
│   ├── login/                       # Authentication
│   └── components/                  # Shared components
├── lib/                             # Library code
│   ├── auth.ts                      # Auth configuration
│   ├── db/                          # Database
│   ├── api/                         # API clients
│   └── ml/                          # ML components
├── public/                          # Static assets
│   └── models/                      # ML models
└── middleware.ts                    # Auth middleware
```

## Credits

- Created by Maeve Kelly (mk2345)
- Used starter code from Assignment 6 (based on [better-auth-nextjs-starter](https://github.com/daveyplate/better-auth-nextjs-starter.git))