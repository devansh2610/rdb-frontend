# Foodoscope API Management Dashboard

A comprehensive full-stack web application for managing API subscriptions, user authentication, analytics, and administration for the Foodoscope platform. This modern React-based dashboard provides both user and administrator interfaces for managing API access, monitoring usage, and handling subscriptions.

## 🚀 Live Deployment

**Production URL**: https://cosylab.iiitd.edu.in/dashboard/
**API Backend**: https://api.foodoscope.com

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Available Scripts](#available-scripts)
- [Application Architecture](#application-architecture)
- [User Roles & Access Levels](#user-roles--access-levels)
- [API Integration](#api-integration)
- [Security Implementation](#security-implementation)
- [Development Guidelines](#development-guidelines)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Team](#team)

## 🎯 Overview

The Foodoscope API Management Dashboard is a sophisticated platform that serves multiple APIs including RecipeDB, FlavorDB, SustainableDB, and DietRx. It provides comprehensive user management, API key generation, token-based billing, analytics, and administrative controls.

### Key Capabilities
- **Multi-API Management**: Unified interface for multiple food-related APIs
- **Token-based System**: Credit-based API usage with real-time tracking
- **Role-based Access**: Support for users, administrators, and super-administrators
- **Interactive Playground**: Test APIs directly from the dashboard
- **Comprehensive Analytics**: Usage tracking, performance metrics, and reporting
- **Secure Authentication**: JWT-based auth with Google OAuth integration

## ✨ Features

### User Features
- **Account Management**
  - User registration with email verification
  - Profile management with avatar selection
  - Password change and account deletion
  - Google OAuth login/signup

- **API Key Management**
  - Generate and manage API keys
  - View API key usage statistics
  - Secure key storage and regeneration

- **Token Management**
  - Real-time token balance tracking
  - Token purchase requests
  - Usage history and analytics

- **API Playground**
  - Interactive API testing interface
  - Real-time parameter validation
  - Response visualization
  - Code example generation

- **Analytics Dashboard**
  - Personal usage statistics
  - API call history
  - Performance metrics
  - Usage trends

### Administrative Features
- **User Management**
  - View and manage all users
  - Block/unblock users
  - Change user access levels and plans
  - Token allocation and management

- **API Catalog Management**
  - Create, edit, and delete APIs
  - Manage sub-APIs and endpoints
  - Monitor API usage across users

- **Email Management**
  - Handle subscription inquiries
  - Manage FAQ responses
  - Compose and send emails

- **System Analytics**
  - Platform-wide usage statistics
  - User engagement metrics
  - API performance monitoring

## 🛠 Technology Stack

### Frontend
- **React 18.2.0** - Modern React with hooks and functional components
- **React Router DOM 6.8.0** - Client-side routing
- **Tailwind CSS 3.2.4** - Utility-first CSS framework
- **Flowbite React 0.3.8** - UI component library
- **Framer Motion 12.6.3** - Animation library
- **React Hook Form 7.43.0** - Form management
- **Axios 1.2.6** - HTTP client for API calls

### Charts & Visualization
- **Chart.js & React-ChartJS-2** - Data visualization
- **Recharts 2.15.1** - React chart library
- **D3 Scale** - Data scaling utilities

### UI & UX
- **React Icons 4.3.1** - Icon library
- **FontAwesome** - Additional icons
- **AOS 2.3.4** - Animation on scroll
- **React Parallax** - Parallax effects
- **React Transition Group** - Transition animations

### Development Tools
- **React Scripts 5.0.1** - Build tools and dev server
- **PostCSS & Autoprefixer** - CSS processing
- **ESLint** - Code linting
- **Jest** - Testing framework

### Testing
- **Cypress** - End-to-end testing
- **React Testing Library** - Component testing
- **Jest** - Unit testing

## 📁 Project Structure

```
Dashboard_Frontend/
├── public/                          # Static assets
│   ├── index.html                   # Main HTML template
│   ├── favicon.ico                  # App icon
│   ├── manifest.json                # PWA manifest
│   ├── LANDING_PAGE_CONTENT.json    # Landing page data
│   ├── PAYMENT_INFO.json            # Payment configuration
│   └── assets/                      # Public images and videos
│
├── src/
│   ├── App.js                       # Main application component
│   ├── index.js                     # Application entry point
│   ├── index.css                    # Global styles
│   │
│   ├── api/                         # API service layer
│   │   ├── axios.js                 # Axios configuration
│   │   ├── adminService.js          # Admin API calls
│   │   ├── analyticsService.js      # Analytics API calls
│   │   └── profileService.js        # User profile API calls
│   │
│   ├── components/                  # Reusable components
│   │   ├── Navigation.js            # Main navigation component
│   │   ├── AdminNavbar.js           # Admin navigation
│   │   ├── AdminSidebar.js          # Admin sidebar
│   │   ├── UsersList.js             # User management component
│   │   ├── APICatalog.js            # API management component
│   │   ├── AdminAnalytics.js        # Admin analytics
│   │   ├── AnimatedTokenDisplay.js  # Token display component
│   │   │
│   │   ├── LandingPageComponents/   # Landing page sections
│   │   ├── UserDashboardComponents/ # User dashboard components
│   │   ├── AnalyticsDashboard/      # Analytics components
│   │   ├── Playground/              # API playground components
│   │   ├── profile/                 # Profile management components
│   │   └── email/                   # Email management components
│   │
│   ├── context/                     # React Context providers
│   │   ├── AuthContext.js           # Authentication context
│   │   └── NotificationsContext.js  # Notifications context
│   │
│   ├── functions/                   # Utility functions
│   │   └── PrivateRoute.js          # Route protection
│   │
│   ├── modals/                      # Modal components
│   │   ├── GenerateAPIKeyModal.js   # API key generation
│   │   ├── ChangePasswordModal.js   # Password change
│   │   ├── TokenExhaustedModal.js   # Token depletion
│   │   ├── PlaygroundModal.js       # API playground
│   │   └── [other modals...]
│   │
│   ├── pages/                       # Page components
│   │   ├── LandingPage.js           # Public landing page
│   │   ├── LoginPage.js             # User login
│   │   ├── SignupPage.js            # User registration
│   │   ├── ProfilePage.js           # User profile
│   │   ├── AdminDashboard.js        # Admin dashboard
│   │   ├── AnalyticsDashboard.js    # Analytics page
│   │   ├── Playground.js            # API playground
│   │   ├── RecipeDb2.0/             # RecipeDB interface
│   │   ├── FlavorDb2.0/             # FlavorDB interface
│   │   └── [other pages...]
│   │
│   ├── styles/                      # Additional CSS files
│   ├── utils/                       # Utility functions
│   └── assets/                      # Local images and assets
│
├── cypress/                         # E2E testing
│   ├── e2e/                         # Test files
│   ├── fixtures/                    # Test data
│   └── support/                     # Test utilities
│
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Tailwind configuration
├── cypress.config.js                # Cypress configuration
└── README.md                        # Project documentation
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Git**

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/cosylab2/Dashboard_Frontend.git
   cd Dashboard_Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_BASE_URL=https://api.foodoscope.com
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
   ```

4. **Start development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Ensure backend API is running on the configured URL

## ⚙️ Environment Configuration

### Required Environment Variables

```env
# API Configuration
REACT_APP_API_BASE_URL=https://api.foodoscope.com

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=804591572675-ajjucrt18uau6kkculefploj7i0l08l5.apps.googleusercontent.com

# reCAPTCHA
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Application Settings
REACT_APP_ENVIRONMENT=development
REACT_APP_APP_NAME=Foodoscope
```

### Configuration Files

- **tailwind.config.js**: Tailwind CSS configuration
- **package.json**: Dependencies and build scripts
- **cypress.config.js**: E2E testing configuration


## 🏗 Application Architecture

### Authentication Flow
1. **User Registration**: Email/password with verification
2. **Login Process**: JWT token generation and storage
3. **Session Management**: Automatic token refresh and validation
4. **Google OAuth**: Alternative authentication method
5. **Access Control**: Role-based route protection

### State Management
- **AuthContext**: User authentication and profile data
- **NotificationsContext**: Real-time notifications
- **Local Storage**: JWT tokens and user preferences
- **Component State**: Form data and UI interactions

### API Communication
- **Axios Interceptors**: Automatic token attachment
- **Error Handling**: Centralized error processing
- **Response Transformation**: Data normalization
- **Retry Logic**: Network failure recovery

## 👥 User Roles & Access Levels

### Access Level Hierarchy
- **Level 0**: SuperAdmin - Full system access
- **Level 1**: CRMAdmin - User and content management
- **Level 2**: APIManager - API and technical management
- **Level 3**: SupportCoordinator - Support and communication
- **Level 4+**: Regular Users - API access and usage

### Subscription Plans
- **Plan 0**: Trial - Limited access
- **Plan 1**: Developer - Standard features
- **Plan 2**: Enterprise - Advanced features
- **Plan 3**: Educational - Academic pricing

### Permission Matrix
| Feature | SuperAdmin | CRMAdmin | APIManager | Support | User |
|---------|------------|----------|------------|---------|------|
| User Management | ✅ | ✅ | ❌ | ❌ | ❌ |
| API Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| Analytics View | ✅ | ✅ | ✅ | ✅ | Limited |
| Email Management | ✅ | ✅ | ❌ | ✅ | ❌ |
| Token Management | ✅ | ✅ | ❌ | ❌ | Self Only |

## 🔌 API Integration

### Available APIs
1. **RecipeDB**: Recipe data and nutritional information
2. **FlavorDB**: Flavor compounds and molecular data
3. **SustainableDB**: Sustainability metrics for food (Coming Soon)
4. **DietRx**: Personalized nutrition recommendations (Coming Soon)

### API Endpoints Structure
```javascript
// User Authentication
POST /login              # User login
POST /register           # User registration
POST /verify/:token      # Email verification
GET  /profile            # User profile
PUT  /profile            # Update profile

// API Management
GET  /apis               # List all APIs
POST /apis               # Create new API (admin)
PUT  /apis/:id           # Update API (admin)
DELETE /apis/:id         # Delete API (admin)

// Token Management
GET  /profile/tokens     # Get token balance
PUT  /profile/requests   # Request tokens
GET  /user/metrics       # Usage analytics

// Admin Operations
GET  /admin/users        # List all users
PATCH /admin/block       # Block user
PATCH /admin/unblock     # Unblock user
PATCH /admin/add-tokens  # Add user tokens
```

### Request/Response Format
```javascript
// Standard API Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-27T10:30:00Z"
}

// Error Response
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

## 🔒 Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Bearer Token**: API request authentication
- **Token Expiry**: Automatic session timeout
- **Refresh Tokens**: Seamless session renewal

### Data Protection
- **Password Hashing**: Bcrypt implementation
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: Anti-CSRF tokens
- **Rate Limiting**: API abuse prevention

### Frontend Security
- **Environment Variables**: Sensitive data protection
- **HTTPS Enforcement**: Secure data transmission
- **Content Security Policy**: XSS mitigation
- **Secure Storage**: Encrypted local storage

### Validation & Verification
- **Email Verification**: 2FA during signup
- **reCAPTCHA**: Bot protection
- **Form Validation**: Client and server-side
- **Access Control**: Route-level protection

## 💻 Development Guidelines

### Code Standards
- **ES6+ Features**: Modern JavaScript syntax
- **Functional Components**: React hooks pattern
- **Consistent Naming**: camelCase for variables, PascalCase for components
- **Comment Guidelines**: JSDoc for functions, inline for complex logic

### Component Structure
```javascript
// Component Template
import React, { useState, useEffect } from 'react';
import { componentUtility } from '../utils/helpers';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  const handleAction = () => {
    // Event handlers
  };

  return (
    <div className="component-container">
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

### State Management Patterns
- **Context API**: Global state (auth, notifications)
- **useState**: Local component state
- **useEffect**: Side effects and data fetching
- **Custom Hooks**: Reusable stateful logic

### API Integration Pattern
```javascript
// Service Layer Example
import axios from '../api/axios';

export const apiService = {
  async getData(params) {
    try {
      const response = await axios.get('/endpoint', { params });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};
```

## 🧪 Testing

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API integration and context testing
- **E2E Tests**: Complete user journey testing
- **Manual Testing**: UI/UX verification

### Running Tests
```bash
# Unit Tests
npm test

# E2E Tests
npm run cypress:open    # Interactive mode
npm run cypress:run     # Headless mode

# Test Coverage
npm run test:coverage
```


### Environment-Specific Configurations
```javascript
// Production environment variables
REACT_APP_API_BASE_URL=https://api.foodoscope.com
REACT_APP_ENVIRONMENT=production
REACT_APP_GOOGLE_CLIENT_ID=production_client_id
```



### CI/CD Pipeline
The application uses automated deployment through:
1. **Code Push**: GitHub repository updates
2. **Build Process**: Automated production build
3. **Deployment**: Server deployment and verification

## 🔧 Troubleshooting

### Common Issues

#### 1. API Connection Issues
```bash
# Check API connectivity
curl -I https://api.foodoscope.com/health

# Verify environment variables
echo $REACT_APP_API_BASE_URL
```

#### 2. Authentication Problems
- Clear localStorage: `localStorage.clear()`
- Check JWT token validity
- Verify Google OAuth configuration

#### 3. Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```



## 📚 Additional Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Flowbite Components](https://flowbite-react.com/)
- [Framer Motion](https://www.framer.com/motion/)

### API Documentation
- [Foodoscope API Docs](https://api.foodoscope.com/docs)
- [Authentication Guide](https://api.foodoscope.com/auth)
- [Rate Limiting](https://api.foodoscope.com/limits)

## 👨‍💻 Team

### Development Team
- **Kanishk Saraswat** - Lead Frontend Developer
- **Harish Hatmode** - Frontend Developer
- **Nakul Panwar** - Frontend Developer
- **Ravi Gupta** - Full Stack Developer


---

## 📄 License

This project is proprietary software developed for CoSyLab at IIIT Delhi. All rights reserved.

---

**Last Updated**: July 2025
**Version**: 2.0.0
**Maintained By**: Foodoscope. Development Team