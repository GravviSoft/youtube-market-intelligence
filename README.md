# YouTube Market Intelligence Dashboard

A full-stack data analysis dashboard for YouTube market intelligence, providing insights into channels, niches, and opportunities for content creators.

## Project Structure

```
youtube-market-intelligence/
├── backend/                 # Node.js + Express API
│   ├── controllers/        # Request handlers
│   ├── database/          # Database connection
│   ├── routes/            # API routes (future)
│   ├── server.js          # Express server
│   └── package.json       # Backend dependencies
│
├── frontend/               # React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   └── package.json       # Frontend dependencies
│
└── README.md
```

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Sequelize** - PostgreSQL ORM
- **PostgreSQL** - Database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

### Frontend
- **React** - UI library
- **PrimeReact** - UI component library
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation

## Features

### Dashboard
- Overview statistics (channels, videos, opportunities)
- Key performance metrics
- Visual analytics with charts
- Real-time data updates

### Channels View
- Comprehensive channel listing
- Sortable and filterable data tables
- Channel metrics (subscribers, views, revenue)
- Saturation scores and niche categorization

### Niches Analysis
- Niche-based analytics
- Revenue and saturation metrics
- Visual distribution charts
- Channel count by niche

### Opportunities Finder
- Advanced filtering system
- Customizable parameters:
  - Maximum saturation score
  - Minimum revenue threshold
  - Maximum copycat count
  - Date range selection
  - Niche search
- Opportunity scoring algorithm
- Direct links to channels

## API Endpoints

### Analytics
- `GET /analytics/stats` - Get overview statistics
- `GET /analytics/channels` - Get channel list (with optional limit)
- `GET /analytics/niches` - Get niche analytics
- `GET /analytics/opportunities` - Get filtered opportunities

### General Data
- `GET /allchannels` - Get total channel count
- `GET /allvideos` - Get total video count
- `GET /newchannels` - Get new channels count (4 weeks)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   PORT=4000
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/youtube_intelligence
   DB_SSL=false
   ```

5. Ensure your PostgreSQL database is set up with the required tables:
   - `channel` table with columns: channel_id, channel_name, channel_url, saturation_score, rev_sort, niche_category, etc.
   - `videos` table with columns: video_id, channel_url, views, etc.

6. Start the backend server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

   The API will be available at `http://localhost:4000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:4000
   ```

5. Start the development server:
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

### Running Both Servers Concurrently

You can run both frontend and backend simultaneously in separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Database Schema

The application expects the following database structure:

### Channel Table
- `channel_id` - Unique identifier
- `channel_name` - Channel name
- `channel_url` - Channel URL
- `saturation_score` - Market saturation (0-1)
- `rev_sort` - Estimated revenue
- `niche_category` - Channel niche
- `search_term` - Associated search term
- `top_vid_copycats` - Number of copycat videos
- `revenue_last_month` - Monthly revenue
- `yearly_revenue` - Annual revenue
- `first_upload_date` - Channel start date
- `sub_count` - Subscriber count (formatted)
- `sub_count_num` - Subscriber count (numeric)
- `views_last_month` - Monthly views
- `rpm_low` - RPM lower bound
- `rpm_high` - RPM upper bound
- `new_channel` - Boolean flag
- `not_interested` - Boolean flag

### Videos Table
- `video_id` - Unique identifier
- `channel_url` - Associated channel
- `views` - View count

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Starts React dev server with hot reload
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `frontend/build` directory.

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment mode
- `DATABASE_URL` - PostgreSQL connection string
- `DB_SSL` - Enable/disable SSL for database

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL

## License

ISC

## Contributing

This is a portfolio project. Feel free to fork and customize for your own use.

## Future Enhancements

- User authentication
- Real-time updates with Socket.io
- Export functionality (CSV, PDF)
- Advanced analytics and predictions
- Custom dashboard widgets
- Channel comparison tools
- Trend analysis
