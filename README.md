# BFCB Quiz Application

A modern, professional quiz application for Bangladesh Future Cricket Board (BFCB) members to test their cricket knowledge and compete with fellow enthusiasts.

## Features

### User Features
- **User Registration**: Simple registration with full name and Facebook account name
- **Timed Quiz**: Text-based questions with individual time limits
- **Mobile-First Design**: Optimized for mobile devices with responsive design
- **Professional UI**: Modern light theme with smooth animations
- **Progress Tracking**: Real-time progress indicators and time warnings
- **Anti-Cheating System**: Measures to prevent cheating during the quiz

### Admin Features
- **Secure Dashboard**: Admin-only access with authentication
- **Question Management**: Add, edit, view, and delete quiz questions
- **Response Evaluation**: Manual scoring and feedback system
- **Merit List**: Automatic ranking based on scores and time
- **Export Functionality**: CSV export for merit lists and responses
- **Statistics**: Overview of participants, questions, and evaluations

## Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Shadcn/ui, Radix UI primitives
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 2. Database Setup
1. Create a new Supabase project.
2. **Option A (New Project)**: Run the SQL scripts in the following order:
   - `scripts/supabase-schema-fixed.sql`
   - `scripts/supabase-rls-policies.sql`
   - `scripts/supabase-seed.sql`
3. **Option B (Existing Project)**: If you have an existing Supabase project, run:
   - `scripts/update-existing-schema.sql` (to add missing columns/constraints)
   - `scripts/cleanup-duplicate-responses.sql` (to remove any existing duplicate responses)
   - `scripts/supabase-rls-policies.sql` (if not already applied)
   - `scripts/supabase-seed.sql` (if you want to re-seed sample data, be careful not to duplicate existing data)

### 3. Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

##4 Key Features Implemented

### 🎯 User Experience
- Modern light theme design
- Smooth animations and transitions
- Mobile-optimized interface
- Real-time timer with visual warnings
- Progress tracking
- Professional loading states

### 🛡️ Admin Panel
- Secure authentication
- Complete question management (CRUD: Create, Read, Update, Delete)
- Response evaluation with scoring
- Merit list generation and ranking
- Export functionality
- Statistics dashboard

### 📊 Database Features
- Optimized PostgreSQL schema
- Row Level Security (RLS)
- Efficient indexing
- Merit list calculation function
- Data integrity constraints (e.g., unique constraint on responses)

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Manual Deployment
1. Build the application: `npm run build`
2. Start the production server: `npm start`

## Security Features

- Row Level Security (RLS) enabled
- Admin authentication
- Input validation
- SQL injection protection
- XSS protection
- Anti-cheating measures (disabled back button, refresh, dev tools)

## Performance Optimizations

- Server-side rendering (SSR)
- Optimized database queries
- Efficient caching
- Image optimization
- Code splitting

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For technical support or questions, please contact the BFCB development team.
