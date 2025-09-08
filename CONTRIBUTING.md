# Contributing to Deepseekdrew

Deepseekdrew is still a very early-stage project, thus the codebase is rapidly changing.

Before opening a pull request, please open an issue and discuss whether the change makes sense in Deepseekdrew. Ensuring a cohesive user experience sometimes means we can't include every possible feature or we need to consider the long-term design of how we want to support a feature area.

For a high-level overview of how Deepseekdrew works, please see the [Architecture Guide](./docs/architecture.md). Understanding the architecture will help ensure your contributions align with the overall design of the project.

Something that I really appreciate are all the non-code contributions, such as reporting bugs, writing feature requests and participating on [Deepseekdrew's sub-reddit](https://www.reddit.com/r/deepseekdrewbuilders).

Deepseekdrew is an Electron app.

## Architecture

The architecture of Deepseekdrew is split between the main process (Node.js) and the renderer process (React). The main process handles things like file system access, the database, and API key management. The renderer process handles the UI and user interactions. The two processes communicate via IPC (Inter-Process Communication).

The renderer process is a React app that uses the Vite build tool. The main process is a Node.js app that uses Electron. The two processes are built separately and then packaged together into a single Electron app.

## Development Setup

1. Clone the repo
2. Run `npm install`
3. Run `npm start` to start the app in development mode

## Code Structure

- `src/main.ts` - Main process entry point
- `src/preload.ts` - Preload script that exposes IPC methods to the renderer
- `src/renderer.tsx` - Renderer process entry point
- `src/ipc/` - IPC handlers
- `src/components/` - React components
- `src/hooks/` - React hooks
- `src/db/` - Database code
- `src/atoms/` - Jotai atoms
- `src/routes/` - TanStack Router routes
- `drizzle/` - Database schema and migrations
- `scaffold/` - Template for generated apps
- `worker/` - Background workers
- `workers/tsc/` - TypeScript compilation worker

## Testing

We have both unit tests and end-to-end tests.

### Unit Tests

Unit tests are written with Vitest and are located in `src/__tests__`. Run them with `npm test`.

### End-to-End Tests

End-to-end tests are written with Playwright and are located in `e2e-tests/`. Run them with `npm run e2e`.

Note that the end-to-end tests require a build of the app to be run first. This is done automatically by the `pre:e2e` script. The build is placed in the `out/` directory.

## Pull Request Process

1. Fork the repo
2. Create a branch for your feature or bug fix
3. Make your changes
4. Write tests if applicable
5. Run `npm run presubmit` to ensure your code passes linting and formatting
6. Commit your changes
7. Push your branch to your fork
8. Open a pull request

## Code Style

We use Prettier for code formatting and Oxlint for linting. Please run `npm run presubmit` before submitting a pull request to ensure your code passes linting and formatting.

We also use TypeScript for type checking. Please run `npm run ts` to ensure your code passes type checking.
