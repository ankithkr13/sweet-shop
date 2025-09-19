# Sweet Shop Management System

A full-stack e-commerce application for managing a sweet shop with user authentication, inventory management, and purchase functionality.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework with custom design tokens
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Robust relational database
- **JWT Authentication** - Secure token-based authentication
- **Pydantic** - Data validation and serialization

## Features

### User Features
- 🔐 User registration and authentication
- 🍭 Browse sweet collection with search and filtering
- 🛒 Purchase sweets with real-time inventory updates
- 📱 Responsive design for all devices
- 🎨 Beautiful orange-themed UI with smooth animations

### Admin Features
- 📊 Admin dashboard with inventory statistics
- ➕ Add, edit, and delete sweets
- 📦 Inventory management and restocking
- 👥 User management capabilities
- 📈 Sales tracking and analytics

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd sweet-shop-management-system
   \`\`\`

2. **Install frontend dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Install backend dependencies**
   \`\`\`bash
   cd backend
   pip install -r requirements.txt
   \`\`\`

4. **Set up environment variables**
   \`\`\`bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   \`\`\`

5. **Set up the database**
   \`\`\`bash
   # Run the SQL scripts in the scripts/ folder
   psql -d your_database -f scripts/01_create_tables.sql
   psql -d your_database -f scripts/02_seed_data.sql
   \`\`\`

### Development

1. **Start the backend server**
   \`\`\`bash
   npm run backend
   # or manually: cd backend && python -m uvicorn main:app --reload
   \`\`\`

2. **Start the frontend development server**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Or run both simultaneously**
   \`\`\`bash
   npm run dev:full
   \`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Default Admin Account
- Email: admin@sweetshop.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Sweets Management
- `GET /api/sweets` - List all sweets
- `POST /api/sweets` - Add new sweet (Admin only)
- `PUT /api/sweets/:id` - Update sweet (Admin only)
- `DELETE /api/sweets/:id` - Delete sweet (Admin only)
- `GET /api/sweets/search` - Search sweets

### Inventory
- `POST /api/sweets/:id/purchase` - Purchase a sweet
- `POST /api/sweets/:id/restock` - Restock inventory (Admin only)

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (Admin only)

## Project Structure

\`\`\`
sweet-shop-management-system/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with design tokens
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth-modal.tsx    # Authentication modal
│   ├── sweet-card.tsx    # Sweet display card
│   └── admin-dashboard.tsx # Admin interface
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication context
├── backend/              # FastAPI backend
│   ├── main.py          # Main application file
│   ├── models.py        # Pydantic models
│   ├── database.py      # Database utilities
│   └── requirements.txt # Python dependencies
└── scripts/             # Database scripts
    ├── 01_create_tables.sql
    └── 02_seed_data.sql
\`\`\`

## Design System

The application uses a custom design system with:
- **Primary Color**: Orange (#ea580c) - Warm and inviting
- **Accent Color**: Bright Orange (#f97316) - For highlights
- **Neutrals**: White, cream, and gray tones
- **Typography**: Geist Sans for clean, modern text
- **Components**: Consistent spacing, rounded corners, and smooth animations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
