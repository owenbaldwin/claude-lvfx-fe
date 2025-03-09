# LVFX Production Management Frontend

A modern Angular-based frontend application for managing film and television production workflows, including script breakdown, shot planning, and team management.

## Features

- **User Authentication**: Secure login and registration with JWT
- **Production Management**: Create and manage multiple productions
- **Script Management**: Upload, view, and break down scripts
- **Script Breakdown**: Organize scripts into sequences, scenes, and action beats
- **Shot Management**: Create and track shots with detailed metadata
- **Team Collaboration**: Add team members with role-based permissions

## Technologies Used

- **Angular 17+**: Modern frontend framework
- **TypeScript**: Type-safe JavaScript
- **RxJS**: Reactive programming with Observables
- **Angular Material**: Material Design components
- **Bootstrap**: Responsive layout and styling
- **Angular CLI**: Development, build, and deployment tools
- **JWT Authentication**: Secure authentication mechanism

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Angular CLI**: v17.0.0 or higher

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/claude-lvfx-fe.git
   cd claude-lvfx-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser and navigate to `http://localhost:4200`

## Connecting to the Backend

This frontend application is designed to work with the LVFX Production Management Backend API. By default, it connects to `http://localhost:3000/api` in development mode.

To configure a different API URL:

1. Open `src/environments/environment.ts` for development or `src/environments/environment.prod.ts` for production
2. Update the `apiUrl` property with your backend API URL

## Build for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── core/               # Core functionality (services, guards, etc)
│   │   ├── components/     # Core components (navbar, footer)
│   │   ├── guards/         # Route guards (auth)
│   │   ├── interceptors/   # HTTP interceptors (auth)
│   │   └── services/       # Core services (auth, API)
│   ├── features/           # Feature modules
│   │   ├── auth/           # Authentication (login, register)
│   │   ├── home/           # Home page
│   │   ├── productions/    # Production management
│   │   ├── scripts/        # Script management
│   │   ├── sequences/      # Sequence management
│   │   ├── scenes/         # Scene management
│   │   ├── action-beats/   # Action beat management
│   │   └── shots/          # Shot management
│   └── shared/             # Shared functionality
│       ├── components/     # Shared components
│       └── models/         # Data models
├── assets/                 # Static assets
└── environments/           # Environment configurations
```

## Testing

```bash
# Unit tests
ng test

# End-to-end tests
ng e2e
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
