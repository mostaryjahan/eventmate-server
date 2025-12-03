# EventMate API Endpoints

## Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

## Users
- `POST /api/users` - Register new user
- `GET /api/users` - Get all users (with pagination & search)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

## Events
- `POST /api/events` - Create new event (HOST/ADMIN)
- `GET /api/events` - Get all events (with search & filters)
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event (HOST/ADMIN)
- `DELETE /api/events/:id` - Delete event (HOST/ADMIN)
- `POST /api/events/:id/join` - Join event
- `DELETE /api/events/:id/leave` - Leave event

## Reviews
- `POST /api/reviews` - Create review for completed event
- `GET /api/reviews/host/:hostId` - Get host reviews & ratings
- `GET /api/reviews/event/:eventId` - Get event reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Payments
- `POST /api/payments/create-session` - Create Stripe payment session
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/my-payments` - Get user's payment history

## Admin
- `GET /api/admin/dashboard` - Get dashboard statistics (ADMIN)
- `PUT /api/admin/users/:userId` - Manage user roles (ADMIN)
- `PUT /api/admin/events/:eventId` - Moderate events (ADMIN)

## Friends
- `POST /api/friends/request` - Send friend request
- `PUT /api/friends/accept/:friendId` - Accept friend request
- `GET /api/friends` - Get friends list
- `GET /api/friends/requests` - Get pending friend requests
- `GET /api/friends/events` - Get friends' events
- `DELETE /api/friends/:friendId` - Remove friend

## Query Parameters

### Events
- `search` - Search in name, description, type
- `type` - Filter by event type
- `location` - Filter by location
- `status` - Filter by status (OPEN, FULL, CANCELLED, COMPLETED)
- `page` - Page number
- `limit` - Items per page
- `sortBy` - Sort field
- `sortOrder` - asc/desc

### Users
- `search` - Search in name, email
- `role` - Filter by role
- `page` - Page number
- `limit` - Items per page