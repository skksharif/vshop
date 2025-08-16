# vshops - Production-Ready E-commerce Frontend

A modern, mobile-first e-commerce frontend built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Mobile-first responsive design** with excellent UX across all devices
- **Authentication system** with cookie + JWT token strategy
- **Role-based access control** (USER/ADMIN)
- **Product catalog** with categories, search, and filtering
- **Shopping cart** with persistent storage
- **Admin panel** for managing users, products, orders, and credits
- **SEO optimized** with meta tags, structured data, and sitemap
- **Accessibility compliant** with WCAG guidelines
- **Performance optimized** with lazy loading and caching

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Forms:** React Hook Form + Zod
- **Data Fetching:** TanStack React Query
- **SEO:** React Helmet Async
- **UI Components:** Custom components with Lucide React icons
- **Notifications:** Sonner

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://ecommerce-backend-z4c1.onrender.com/api/v1
VITE_SITE_URL=https://vshops.example
```

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vshops
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
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

## 🔐 Authentication

The app uses a hybrid authentication approach:

- **HTTP-only cookies** for secure session management
- **JWT tokens** stored in memory and localStorage (when "Remember me" is checked)
- **Automatic token refresh** with fallback to logout on failure
- **Role-based protection** for admin routes

### Authentication Flow:
1. User logs in with email/password
2. Server returns JWT tokens and sets HTTP-only cookies
3. Client stores access token based on "Remember me" preference
4. All API requests include both cookie and Authorization header
5. On token expiry, automatic refresh attempt
6. On refresh failure, user is logged out

## 🛍️ Core Features

### User Features:
- Browse products by category
- View detailed product information
- Add items to shopping cart
- User profile management
- Responsive mobile design

### Admin Features:
- User verification and KYC management
- Category and product management
- Order processing (approve/ship)
- Credit limit management
- Dashboard with quick stats

## 🎨 Design System

- **Color System:** 6 color ramps (primary, secondary, accent, success, warning, error)
- **Typography:** 3 font weights maximum, proper line spacing
- **Spacing:** Consistent 8px spacing system
- **Components:** Reusable, accessible components
- **Mobile-first:** Responsive breakpoints for optimal viewing

## 🔍 SEO Features

- **Meta tags** for all pages with dynamic content
- **Open Graph** and Twitter Card support
- **JSON-LD structured data** for products
- **Canonical URLs** for all pages
- **Sitemap.xml** and robots.txt
- **Semantic HTML** with proper heading hierarchy

## 📱 Mobile Experience

- **Bottom navigation** for easy thumb access
- **Touch-friendly** 44px minimum touch targets
- **Pull-to-refresh** on product lists
- **Mobile-optimized** image carousels and filters
- **Responsive grid** layouts

## 🚀 Performance

- **Code splitting** with lazy loading
- **Image optimization** with proper sizing
- **Query caching** with TanStack React Query
- **Skeleton loading** states
- **Optimized bundles** with Vite

## 📊 API Integration

The frontend integrates with the backend API using these exact endpoints:

- `POST /user/register` - User registration
- `POST /user/login` - User authentication
- `GET /category/getCatergory` - Fetch categories
- `GET /category/products-by-category` - Fetch products by category
- `GET /category/getProduct` - Fetch single product
- Admin endpoints for user verification, product management, orders, etc.

## 🧪 Quality Assurance

### Testing Checklist:
- [ ] Authentication flows (login, logout, token refresh)
- [ ] Role-based access control
- [ ] Mobile responsiveness across devices
- [ ] Shopping cart persistence
- [ ] Admin panel functionality
- [ ] SEO meta tags and structured data
- [ ] Accessibility compliance
- [ ] Performance metrics (Lighthouse scores)

## 🔧 Development Scripts

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the coding standards
4. Test thoroughly across devices
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.