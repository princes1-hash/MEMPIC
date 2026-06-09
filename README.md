# MemPic

MemPic is a web-based media management platform designed for college clubs and event organizers. It helps manage event galleries, media uploads, member-only content, and photographer workflows in one place.

The project allows administrators and photographers to create events, upload photos/videos, organize media by club, and share content with members or the public.


## Features

### User Management

* User registration and login
* Secure password storage using bcrypt
* JWT-based authentication
* Role-based access control

### Roles

* **Admin** – Full access to events, media, and photographers
* **Photographer** – Upload and manage media for assigned clubs
* **Member** – Access member-only galleries
* **User** – View public content

### Event Management

* Create and manage events
* Add event details such as:

  * Event name
  * Date and time
  * Venue
  * Category
  * Description
* Public and member-only event visibility

### Media Management

* Upload images and videos
* Cloudinary integration for media storage
* Event-based media organization
* Media visibility control (public or members only)

### Club Support

The platform supports multiple clubs, including:

* Cognizance
* Thomso
* MARS
* CIG
* SDSLabs
* UBA
* SocBiz
* BlocSoc

### Additional Features

* Comments on media
* Notifications system
* User profiles
* Recent uploads dashboard
* Member gallery access


## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication & Security

* JWT (JSON Web Token)
* bcrypt
* Cookie Parser
* Express Session

### File Storage

* Cloudinary
* Multer
* Multer Cloudinary Storage

### Frontend

* EJS Templates
* HTML
* CSS
* JavaScript

### Real-Time Features

* Socket.IO


## Project Structure

MemPic/
│
├── config/
│   ├── cloudinary.js
│   └── mongoose-connection.js
│
├── middlewares/
│   └── isLoggedIn.js
│
├── models/
│   ├── user-model.js
│   ├── event-model.js
│   ├── media-model.js
│   ├── comment-model.js
│   └── live-notifications.js
│
├── routes/
│   ├── main.js
│   ├── event.js
│   ├── media.js
│   ├── profile.js
│   ├── members.js
│   ├── notification.js
│   ├── comment.js
│   └── userIn.js
│
├── views/
│   ├── partials/
│   ├── admin/
│   ├── photographer/
│   ├── members/
│   ├── profile/
│   └── event/
│
├── utils/
│   ├── upload.js
│   └── helper-functions.js
│
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── uploads/
│
├── .env
├── app.js
├── package.json
├── package-lock.json
└── README.md


## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd MemPic
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory and add:

```env
MONGODB_URI=your_mongodb_connection_string

JWT_KEY=your_jwt_secret

EXPRESS_SESSION_SECRET=your_session_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Start the application

```bash
npm start
```

The server will start on the configured port.


## Main Modules

### Authentication

Handles user registration, login, session management, and role verification.

### Events

Allows administrators and photographers to create and manage events.

### Media

Handles uploading, storing, and displaying event-related photos and videos.

### Members Area

Provides access to private content for club members.

### Notifications

Supports real-time updates and notifications using Socket.IO.

### Profile

Displays user information and uploaded media statistics.


## Future Improvements

* Advanced search and filtering
* Media download options
* User activity tracking
* Event analytics dashboard
* Mobile-responsive UI improvements
* Email notifications
* Social sharing features


## Author

Prince Sharma
