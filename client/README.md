# Village Angel - Premium E-commerce Frontend

A modern, mobile-first e-commerce frontend built with React, TypeScript, and Tailwind CSS, featuring a distinctive red and gold theme.

## 🏆 Key Features

- **Robust Authentication System** with automatic token refresh every 14 minutes
- **Persistent State Management** - no logout on page refresh
- **Role-based Access Control** (USER/ADMIN)
- **Mobile-first Responsive Design** with red and gold Village Angel branding
- **Shopping Cart** with persistent storage
- **Admin Panel** for managing users, products, orders, and credits
- **SEO Optimized** with meta tags and structured data
- **Performance Optimized** with lazy loading and caching

## 🎨 Design Theme

Village Angel features a premium red and gold color scheme:
- **Primary Red**: #dc2626 (village-red-600)
- **Primary Gold**: #fbbf24 (village-gold-400)
- **Gradients**: Subtle red-to-gold gradients throughout the interface
- **Typography**: Clean, modern fonts with proper hierarchy

## 🔐 Authentication System

### Automatic Token Refresh
- Access tokens refresh automatically every 14 minutes
- Seamless user experience with no interruptions
- Fallback to logout if refresh fails

### State Persistence
- "Remember Me" option for persistent sessions
- Proper state restoration on page refresh
- Secure token storage with configurable persistence

### Authentication Flow
1. User logs in with email/password
2. Server returns JWT access and refresh tokens
3. Client stores tokens based on "Remember Me" preference
4. Automatic refresh scheduled every 14 minutes
5. On refresh failure, user is gracefully logged out

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with custom Village Angel theme
- **Routing:** React Router v6
- **State Management:** Zustand with persistence
- **HTTP Client:** Axios with interceptors
- **Forms:** React Hook Form + Zod validation
- **Data Fetching:** TanStack React Query
- **SEO:** React Helmet Async
- **UI Components:** Custom components with Lucide React icons
- **Notifications:** Sonner with custom theming

## 🌍 Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_BASE_URL=https://ecommerce-backend-z4c1.onrender.com/api/v1
VITE_SITE_URL=https://villageangel.example
```

## 📦 Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (NavBar, BottomNav)
│   ├── product/        # Product-related components
│   └── ui/             # Generic UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries (axios config)
├── pages/              # Page components
│   └── admin/          # Admin panel pages
├── services/           # API service functions
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
└── App.tsx            # Main application component
```

## 🔧 Key Components

### Authentication Store (`src/store/auth.ts`)
- Manages user authentication state
- Handles automatic token refresh
- Provides persistent session management
- Includes proper cleanup on logout

### Axios Configuration (`src/lib/axios.ts`)
- Automatic token injection
- Response interceptors for 401 handling
- Automatic token refresh on expired tokens
- Proper error handling and user feedback

### Protected Routes (`src/components/auth/ProtectedRoute.tsx`)
- Role-based access control
- Authentication verification
- Graceful loading states
- Proper redirects for unauthorized access

## 🎯 Authentication Best Practices

### Token Management
- Access tokens stored in memory for security
- Refresh tokens persisted based on user preference
- Automatic cleanup on logout
- Secure token refresh mechanism

### State Management
- Proper initialization on app startup
- No state loss on page refresh
- Loading states during authentication checks
- Error handling for failed authentication

### User Experience
- Seamless token refresh (no user interruption)
- Proper loading indicators
- Clear error messages
- Intuitive navigation based on user role

## 🚀 Performance Features

- **Code Splitting** with lazy loading
- **Optimized Images** with proper sizing
- **Query Caching** with TanStack React Query
- **Skeleton Loading** states
- **Optimized Bundles** with Vite

## 📱 Mobile Experience

- **Bottom Navigation** for easy thumb access
- **Touch-friendly** 44px minimum touch targets
- **Responsive Grid** layouts
- **Mobile-optimized** forms and interactions

## 🔍 SEO Features

- **Dynamic Meta Tags** for all pages
- **Open Graph** and Twitter Card support
- **Canonical URLs** for all pages
- **Semantic HTML** with proper heading hierarchy

## 🧪 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 🌐 Production Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables for production
4. Ensure proper CORS settings on the backend

## 🔒 Security Features

- **HTTP-only Cookies** support
- **CSRF Protection** with proper headers
- **Secure Token Storage** with configurable persistence
- **Role-based Access Control**
- **Automatic Session Management**

## 📄 License

This project is licensed under the MIT License.

---

**Village Angel** - Your trusted partner for premium e-commerce experiences.