# Medify Frontend

A beautiful, medical-themed React application for the Medify healthcare platform.

## Features

- 🏥 **User Registration** - Clean and intuitive registration form with validation
- 🔐 **User Login** - Secure authentication with error handling
- 🎨 **Medical-Themed Design** - Beautiful gradient backgrounds and modern UI
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔒 **Protected Routes** - Authentication-based route protection
- ⚡ **Fast & Modern** - Built with Vite and React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000` (or configure in `.env`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
medify_frontend/
├── src/
│   ├── config/
│   │   └── api.js          # API configuration and axios setup
│   ├── context/
│   │   └── AuthContext.jsx # Authentication context provider
│   ├── pages/
│   │   ├── Login.jsx       # Login page
│   │   ├── Login.css       # Login page styles
│   │   ├── Register.jsx    # Registration page
│   │   ├── Register.css    # Registration page styles
│   │   ├── Home.jsx        # Home page (protected)
│   │   └── Home.css        # Home page styles
│   ├── App.jsx             # Main app component with routing
│   ├── App.css             # App styles
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
└── package.json
```

## API Endpoints Used

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Features in Detail

### Registration Page
- Full name, email, phone number
- Password with confirmation
- Optional date of birth and gender
- Client-side validation
- Error handling and display

### Login Page
- Email and password authentication
- Error handling
- Loading states
- Redirect to home on success

### Authentication
- JWT token-based authentication
- Token stored in localStorage
- Automatic token injection in API requests
- Protected routes for authenticated users

## Design Theme

The application features a medical-themed design with:
- Purple gradient backgrounds (#667eea to #764ba2)
- Clean white cards with subtle shadows
- Medical iconography
- Smooth animations and transitions
- Responsive grid layouts

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

Part of the Medify healthcare platform.
