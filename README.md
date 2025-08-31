# Amazon Clone - Full Stack E-Commerce Platform

A complete e-commerce web application inspired by Amazon, featuring user authentication, product management, shopping cart, payment processing, and order management.

## 🚀 Features

### User Management
- User registration and authentication
- Email verification system
- Password reset functionality
- User profile management
- JWT-based authentication

### Product Management
- Product listing with pagination
- Product details with image galleries
- Category-based filtering
- Price filtering and sorting
- Product search functionality
- Product reviews and ratings

### Shopping Experience
- Shopping cart functionality
- Wishlist management
- Secure checkout process
- Multiple payment options
- Order tracking and history

### Payment & Orders
- Stripe payment integration
- Order management system
- Order status tracking
- Email notifications
- Invoice generation

## 🛠 Tech Stack

### Backend
- **Framework:** Django 4.x
- **API:** Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT (Simple JWT)
- **File Storage:** Django File Storage
- **Payment:** Stripe API
- **Email:** Django Email Backend

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Forms:** Formik + Yup validation
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **State Management:** Redux Toolkit (for cart)
- **Payment:** Stripe.js

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/amazon-clone.git
cd amazon-clone
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv django-env
source django-env/bin/activate  # On Windows: django-env\Scripts\activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/amazon_clone
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_PORT=587
EMAIL_USE_TLS=True
```

#### Database Setup
```bash
# Create PostgreSQL database
createdb amazon_clone

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data (optional)
python manage.py loaddata fixtures/products.json
```

#### Start Backend Server
```bash
python manage.py runserver
```
Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration (Optional)
Create a `.env` file in the frontend directory if needed:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

#### Start Frontend Server
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
amazon-clone/
├── backend/
│   ├── backend/              # Django project settings
│   ├── users/               # User management app
│   │   ├── api/            # User API views and serializers
│   │   ├── models.py       # User model
│   │   └── migrations/     # Database migrations
│   ├── products/           # Product management app
│   │   ├── api/           # Product API views
│   │   ├── models.py      # Product models
│   │   └── management/    # Custom management commands
│   ├── cart/              # Shopping cart app
│   ├── orders/            # Order management app
│   ├── payments/          # Payment processing app
│   ├── contact/           # Contact form app
│   ├── media_root/        # Uploaded files
│   ├── requirements.txt   # Python dependencies
│   └── manage.py         # Django management script
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service functions
│   │   ├── context/      # React context providers
│   │   ├── redux/        # Redux store and actions
│   │   ├── schemas/      # Form validation schemas
│   │   ├── utils/        # Utility functions
│   │   └── api/          # API configuration
│   ├── public/           # Static assets
│   ├── package.json      # Node.js dependencies
│   └── vite.config.js    # Vite configuration
├── .gitignore
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/verify-email/<token>/` - Email verification
- `POST /api/auth/forgot-password/` - Password reset request
- `POST /api/auth/reset-password/<token>/` - Password reset

### Products
- `GET /api/products/` - List products with filtering
- `GET /api/products/<id>/` - Product details
- `POST /api/products/<id>/reviews/` - Add product review

### Cart
- `GET /api/cart/` - Get user's cart
- `POST /api/cart/add/` - Add item to cart
- `PUT /api/cart/update/<id>/` - Update cart item
- `DELETE /api/cart/remove/<id>/` - Remove cart item

### Orders
- `GET /api/orders/` - List user's orders
- `POST /api/orders/create/` - Create new order
- `GET /api/orders/<id>/` - Order details

### Payments
- `POST /api/payments/create-payment-intent/` - Create Stripe payment intent
- `GET /api/payments/stripe-config/` - Get Stripe configuration

## 🎨 Frontend Components

### Key Components
- **Navbar** - Navigation with search and cart
- **ProductCard** - Product display component
- **FilterSidebar** - Product filtering options
- **ShoppingCart** - Cart management
- **CheckoutForm** - Order checkout process
- **PaymentForm** - Stripe payment integration

### Pages
- **Home** - Landing page with featured products
- **ProductDetails** - Individual product view
- **CartPage** - Shopping cart management
- **CheckoutPage** - Order checkout
- **Profile** - User profile management
- **OrderHistory** - Past orders view

## 🔒 Authentication Flow

1. User registers with email and password
2. Email verification link sent
3. User verifies email and can login
4. JWT tokens issued for authentication
5. Protected routes require valid JWT token

## 💳 Payment Integration

- Stripe Elements for secure payment forms
- Support for multiple payment methods
- Real-time payment processing
- Order confirmation and email receipts

## 📱 Responsive Design

- Mobile-first design approach
- Tailwind CSS for styling
- Responsive navigation and layouts
- Touch-friendly interface

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🚀 Deployment

### Backend Deployment (Heroku example)
```bash
# Install Heroku CLI and login
heroku create amazon-clone-api
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set DEBUG=False
git subtree push --prefix=backend heroku main
```

### Frontend Deployment (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Environment Variables Reference

### Backend (.env)
```env
DEBUG=True/False
SECRET_KEY=django-secret-key
DATABASE_URL=postgresql://user:pass@host:port/dbname
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=email@gmail.com
EMAIL_HOST_PASSWORD=app-password
EMAIL_PORT=587
EMAIL_USE_TLS=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check database credentials in .env

2. **CORS errors**
   - Verify CORS_ALLOWED_ORIGINS in settings
   - Check API base URL in frontend

3. **Stripe payment issues**
   - Verify Stripe keys are correct
   - Check webhook endpoints

4. **Email verification not working**
   - Configure email settings properly
   - Check spam folder for verification emails

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Django and React communities
- Stripe for payment processing
- Tailwind CSS for styling
- All contributors and testers

## 📞 Support

For support, email mahmoud@example.com or create an issue in this repository.

---

**Note:** This is a learning project inspired by Amazon. Not affiliated with Amazon Inc.