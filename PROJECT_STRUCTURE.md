# Party Fud Frontend - Project Structure

## Overview
This is a Next.js 16 application for Party Fud, a catering management platform. The application supports three user types: Caterers, Users, and Admins.

## Project Structure

```
partyfud-frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (group)
│   │   ├── login/                # Login page
│   │   └── signup/               # Signup page (with user type selection)
│   ├── caterer/                  # Caterer-specific routes
│   │   ├── layout.tsx            # Caterer layout with sidebar
│   │   ├── dashboard/            # Dashboard page
│   │   ├── menus/                # Menu items management
│   │   ├── packages/              # Package management
│   │   │   ├── page.tsx          # Packages list
│   │   │   ├── create/           # Create package page
│   │   │   └── [id]/edit/        # Edit package page
│   │   └── orders/               # Orders page (placeholder)
│   ├── user/                     # User-specific routes (to be implemented)
│   ├── admin/                    # Admin-specific routes (to be implemented)
│   ├── layout.tsx                # Root layout with AuthProvider
│   └── page.tsx                  # Root page (redirects based on auth)
│
├── components/                    # Reusable components
│   ├── layout/                   # Layout components
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── Header.tsx            # Top header with search and user info
│   └── ui/                       # UI components
│       ├── Button.tsx             # Button component with variants
│       ├── Input.tsx              # Input field component
│       ├── Select.tsx             # Select dropdown component
│       └── Modal.tsx              # Modal dialog component
│
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Authentication context and provider
│
├── lib/                          # Utility libraries
│   └── api/                      # API service files
│       ├── config.ts             # API configuration and helpers
│       ├── auth.api.ts           # Authentication API
│       ├── caterer.api.ts        # Caterer API endpoints
│       ├── user.api.ts           # User API endpoints
│       └── admin.api.ts          # Admin API endpoints
│
└── middleware.ts                # Next.js middleware
```

## Key Features

### Authentication
- **Login Page**: Email/password authentication
- **Signup Page**: Registration with user type selection (User/Caterer)
- **Auth Context**: Global authentication state management
- **Token Management**: Automatic token storage and retrieval from localStorage

### Caterer Features
1. **Dashboard**: Overview page with stats (placeholder)
2. **Menus Page**:
   - List all dishes with filters (Cuisine Type, Category)
   - Edit dish functionality (modal)
   - Delete dish with confirmation
   - Display dish details (image, name, weight, rating, price, availability)
3. **Packages Page**:
   - List all packages
   - Create new package button
   - Edit package functionality
   - Display package details
4. **Orders Page**: Placeholder for future implementation

### API Integration
- All API calls are centralized in `lib/api/` files
- Automatic token injection in requests
- Error handling and response typing
- Base URL configurable via environment variable

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Design System

### Colors
- Primary Green: `#22c55e` (Tailwind: `green-500`)
- Hover Green: `#16a34a` (Tailwind: `green-600`)
- Background: White and gray-50
- Sidebar: gray-800

### Components
- All UI components are reusable and follow consistent styling
- Button variants: primary, secondary, danger, outline
- Form inputs with error states
- Modal dialogs for confirmations and forms

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Next Steps

1. **User Pages**: Implement user-facing pages for browsing dishes and packages
2. **Admin Pages**: Implement admin dashboard and management pages
3. **API Integration**: Connect to actual backend API endpoints
4. **Cuisine Types & Categories**: Fetch and display from API
5. **Package Types**: Fetch and display from API
6. **Image Upload**: Implement image upload functionality
7. **Orders Management**: Complete orders page with order management
8. **Analytics**: Add analytics dashboard

## Code Quality

- TypeScript for type safety
- Reusable components to minimize code duplication
- Clean separation of concerns (API, components, contexts)
- Consistent naming conventions
- Professional code structure suitable for scaling

