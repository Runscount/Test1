# RunScout

RunScout helps runners in Chicago discover safe & fun running routes. Browse recommended routes on an interactive map, see detailed route information, and save your favorites.

## Features

- 🗺️ **Interactive Map**: Browse routes on a Mapbox-powered map with route highlighting
- 🔍 **Route Explorer**: Filter routes by distance, surface type, and sort by safety, scenic score, or distance
- 📊 **Detailed Route Information**: View comprehensive route details including safety scores, weather comfort, scenic ratings, and more
- 🔐 **Authentication**: Sign up and log in to save favorite routes (coming soon)
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Maps**: Mapbox GL JS
- **Database & Auth**: Supabase
- **Deployment**: Ready for Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Mapbox account (free tier available)
- A Supabase account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd runscout
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Mapbox Token
# Get your token from: https://account.mapbox.com/access-tokens/
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

# Supabase Configuration
# Get these from your Supabase project settings > API
# Project URL: https://your-project.supabase.co
# Anon Key: Your anon/public key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Getting Your Mapbox Token

1. Sign up for a free account at [Mapbox](https://www.mapbox.com/)
2. Go to [Account > Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copy your default public token or create a new one
4. Add it to your `.env.local` file as `NEXT_PUBLIC_MAPBOX_TOKEN`

### Getting Your Supabase Credentials

1. Sign up for a free account at [Supabase](https://supabase.com/)
2. Create a new project
3. Go to **Settings > API**
4. Copy your **Project URL** and **anon/public key**
5. Add them to your `.env.local` file:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
runscout/
├── app/
│   ├── auth/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── routes/
│   │   ├── [id]/           # Individual route detail page
│   │   └── page.tsx        # Routes explorer page
│   ├── profile/            # User profile page (protected)
│   ├── layout.tsx          # Root layout with Navbar/Footer
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── Map.tsx             # Mapbox map component
│   ├── Navbar.tsx          # Navigation bar
│   └── Footer.tsx          # Footer component
├── data/
│   └── routes.ts           # Sample route data (8 Chicago routes)
├── lib/
│   ├── supabase.ts         # Supabase client configuration
│   └── utils.ts            # Utility functions
└── types/
    └── route.ts            # TypeScript route type definitions
```

## Current Data

The app currently uses mock data from `data/routes.ts` with 8 sample Chicago running routes:

- Lakefront Trail - North
- Lincoln Park Loop
- 606 Trail - West
- North Branch Trail
- Grant Park Loop
- Montrose Beach to Foster Beach
- Riverwalk Loop
- Jackson Park Trail

Each route includes:
- Distance, elevation gain, surface type
- Safety, weather comfort, scenic, and popularity scores
- GeoJSON coordinates for map display
- Route shape (loop, point-to-point, out-and-back)

## Future Enhancements

- [ ] Connect to Supabase database for route storage
- [ ] User favorites/saved routes functionality
- [ ] Route reviews and ratings
- [ ] Weather integration for real-time conditions
- [ ] Route sharing and social features
- [ ] Advanced filtering (elevation, lighting, etc.)
- [ ] Route planning and customization

## Notes

- The app works without Supabase credentials for browsing routes (uses mock data)
- Authentication requires valid Supabase credentials
- Mapbox token is required for map functionality
- All routes are currently stored in `data/routes.ts` as TypeScript data

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
