# SMemory Application for Shooting Club

This project is a web application for a shooting club to track and visualize performance data.

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express.js
- Database: MongoDB

## Getting Started

### Prerequisites

- Node.js and npm
- Docker and Docker Compose
- MongoDB

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Run `docker-compose up --build` to start all services

## Usage

- Access the frontend at `http://localhost:3000`
- The backend API is available at `http://localhost:5000`

## Features

- User authentication
- Performance data tracking
- Data visualization with charts

## Development

- Frontend code is in the `frontend` directory
- Backend code is in the `backend` directory

## Deployment

This application is containerized and can be deployed using Docker on a Raspberry Pi or any other compatible system.

## Security

- Passwords are hashed using bcrypt
- JWT is used for authentication
- HTTPS should be enabled in production

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details
