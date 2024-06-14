Here's a `README.md` documentation for your project:

```markdown
# Ticket Fusion Server

Ticket Fusion is a server application for managing events, users, comments, seat bookings, and payments. This project is built using Node.js, Express, MongoDB, and integrates with Stripe for payment processing.

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
  - [Comments](#comments)
  - [Events](#events)
  - [Seat Booking](#seat-booking)
  - [Users](#users)
  - [Payments](#payments)
- [Authentication](#authentication)
- [Permissions Policy](#permissions-policy)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ticket-fusion-server.git
   cd ticket-fusion-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```env
   PORT=your_port_number
   DB_URI=your_mongodb_uri
   PAYMENT_SECRET_KEY=your_stripe_secret_key
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Configuration

Ensure you have a MongoDB database and a Stripe account. Configure the connection string and API keys in your `.env` file.

## API Endpoints

### Comments

- **Create Comment**
  - **POST** `/comments`
  - Request Body: 
    ```json
    {
      "eventId": "event_id",
      "comment": "Your comment",
      "email": "user_email"
    }
    ```
  - Headers: 
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```
  - Response: JSON with the inserted comment.

- **Get Comments**
  - **GET** `/comments`
  - Response: JSON array of comments.

### Events

- **Create Event**
  - **POST** `/events`
  - Request Body: 
    ```json
    {
      "title": "Event Title",
      "description": "Event Description",
      "date": "Event Date",
      "price": "Event Price"
    }
    ```
  - Headers: 
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```
  - Response: JSON with the inserted event.

- **Get Events**
  - **GET** `/events`
  - Response: JSON array of events.

- **Get Event by ID**
  - **GET** `/events/:id`
  - Response: JSON of the specific event.

- **Update Event**
  - **PATCH** `/events/:id`
  - Request Body: 
    ```json
    {
      "title": "Updated Event Title",
      "description": "Updated Event Description",
      "date": "Updated Event Date",
      "price": "Updated Event Price"
    }
    ```
  - Headers: 
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```
  - Response: JSON with the updated event.

- **Delete Event**
  - **DELETE** `/events/:id`
  - Headers: 
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```
  - Response: JSON with the deletion result.

### Seat Booking

- **Book Seat**
  - **POST** `/sitBook`
  - Request Body: 
    ```json
    {
      "eventId": "event_id",
      "email": "user_email",
      "ticketNumber": "number_of_tickets",
      "price": "total_price"
    }
    ```
  - Headers: 
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```
  - Response: JSON with the booking result.

- **Get Seat Bookings**
  - **GET** `/sitBook`
  - Response: JSON array of seat bookings.

- **Get Seat Booking by ID**
  - **GET** `/singleSitBook/:id`
  - Response: JSON of the specific seat booking.

- **Delete Seat Booking**
  - **DELETE** `/sitBook/:id`
  - Headers: 
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```
  - Response: JSON with the deletion result.

- **Get Seat Booking by Event ID and Email**
  - **GET** `/sitBook/:eventId/:email`
  - Response: JSON of the specific seat booking.

- **Update Seat Booking**
  - **PATCH** `/sitBook/:id`
  - Request Body: 
    ```json
    {
      "ticketNumber": "updated_ticket_number",
      "price": "updated_price"
    }
    ```
  - Response: JSON with the updated booking.

### Users

- **Create User**
  - **POST** `/users`
  - Request Body: 
    ```json
    {
      "name": "User Name",
      "email": "user_email",
      "password": "user_password"
    }
    ```
  - Response: JSON with the creation result and token.

- **Get Users**
  - **GET** `/users`
  - Response: JSON array of users.

- **Get User by Email**
  - **GET** `/users/:email`
  - Response: JSON of the specific user.

- **Update User**
  - **PATCH** `/users/:email`
  - Request Body: 
    ```json
    {
      "name": "Updated User Name",
      "password": "Updated User Password"
    }
    ```
  - Headers: 
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```
  - Response: JSON with the updated user.

### Payments

- **Create Payment Intent**
  - **POST** `/create-payment-intent`
  - Request Body: 
    ```json
    {
      "price": "total_price"
    }
    ```
  - Headers: 
    ```json
    {
      "Authorization": "Bearer <token>"
    }
    ```
  - Response: JSON with the client secret.

- **Submit Payment**
  - **POST** `/payments`
  - Request Body: 
    ```json
    {
      "email": "user_email",
      "eventId": "event_id",
      "price": "total_price",
      "paymentIntentId": "payment_intent_id"
    }
    ```
  - Response: JSON with the payment result and deletion result.

- **Get Payment History**
  - **GET** `/paymentHistory/:email`
  - Response: JSON array of payments.

## Authentication

The application uses JWT for authentication. To create a token, the server generates a JWT token upon user registration or login. This token is required for protected routes.

## Permissions Policy

The server sets a `Permissions-Policy` header to disable the `interest-cohort` feature:
```javascript
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', "interest-cohort=()");
  next();
});
```

## Contributing

Feel free to submit issues or pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
```

This `README.md` provides a comprehensive guide to your server application, including setup, configuration, API endpoints, authentication, and additional information relevant to developers using or contributing to your project.