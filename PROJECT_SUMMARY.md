# LVFX Production Management Frontend - Project Summary

This document provides an overview of the Angular frontend application for the LVFX Production Management System.

## Project Structure and Architecture

The application follows a modular and scalable architecture with the following key components:

### Core Module

The `CoreModule` contains application-wide singleton services and components:

- **Authentication**: JWT-based authentication with token storage and refresh
- **API Services**: Services for communicating with the backend API
- **Interceptors**: HTTP interceptors for auth token injection and error handling
- **Guards**: Route guards for protecting authenticated routes

### Feature Modules

Feature modules organize the application by functional areas:

1. **Auth Module**: Login, registration, and profile management
2. **Home Module**: Landing page and dashboard
3. **Productions Module**: Production management (create, edit, view, delete)
4. **Scripts Module**: Script management and breakdown
5. **Sequences Module**: Sequence management
6. **Scenes Module**: Scene management
7. **Action Beats Module**: Action beat management
8. **Shots Module**: Shot management

### Shared Module

The `SharedModule` contains reusable components, directives, and pipes that are used across multiple feature modules:

- **Components**: Loading indicators, error messages, confirmation dialogs
- **Models**: Data models and interfaces
- **Styles**: Common SCSS styles and variables

## Key Technologies

- **Angular 17**: Modern web framework with component-based architecture
- **Angular Material**: UI component library following Material Design
- **Bootstrap**: CSS framework for responsive layout and styling
- **RxJS**: Reactive library for handling asynchronous operations
- **TypeScript**: Type-safe JavaScript for better code quality and developer experience
- **JWT**: JSON Web Tokens for secure authentication

## API Integration

The application integrates with a Rails backend API through the following services:

- `AuthService`: Authentication operations
- `UserService`: User management
- `ProductionService`: Production management
- `ProductionUserService`: Managing user roles within productions
- `ScriptService`: Script management
- `SequenceService`: Sequence management
- `SceneService`: Scene management
- `ActionBeatService`: Action beat management
- `ShotService`: Shot management

## Authentication & Authorization

The application implements a comprehensive authentication system:

- JWT tokens stored in local storage
- Auth interceptor to add tokens to API requests
- Route guards to protect authenticated routes
- Error interceptor to handle authentication errors (401)
- Role-based access control for production resources

## User Flows

The application supports the following key user flows:

1. **Authentication**
   - User registration
   - Login
   - Password recovery
   - Profile management

2. **Production Management**
   - Create new productions
   - View production details
   - Edit production details
   - Delete productions
   - Add/remove team members

3. **Script Breakdown**
   - Upload scripts
   - Break down scripts into sequences
   - Break down sequences into scenes
   - Break down scenes into action beats
   - Create shots from action beats

4. **Shot Management**
   - Create/edit/delete shots
   - Track shot status
   - Add shot metadata (camera, framing, etc.)

## Deployment Instructions

The application can be deployed using the following steps:

1. Build the application for production:
   ```bash
   ng build --configuration production
   ```

2. Deploy the contents of the `dist/` directory to a web server or CDN

3. Ensure the server is configured to serve the `index.html` file for all routes (for Angular routing to work)

## Future Enhancements

Planned enhancements for future iterations:

1. **Offline Support**: Implement IndexedDB for offline data access
2. **Real-time Collaboration**: Add WebSocket support for real-time updates
3. **File Uploads**: Add support for uploading and viewing storyboards and reference images
4. **Reporting**: Add reporting and analytics features
5. **Mobile App**: Create a companion mobile app using Angular/Ionic
6. **Performance Optimization**: Implement virtual scrolling for large datasets

## Testing Strategy

The application includes:

- **Unit Tests**: Testing individual components and services
- **Integration Tests**: Testing interactions between components
- **End-to-End Tests**: Testing full user flows

## Conclusion

This Angular frontend application provides a modern, responsive, and user-friendly interface for the LVFX Production Management System. It follows best practices for scalability, maintainability, and performance, making it suitable for production use and future expansion.
