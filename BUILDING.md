# Getting Started with Create React App

This project is built with [Vite](https://vitejs.dev/)

## Available Scripts

In the project directory, you can run:

### `pnpm dev`

This command runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page reloads when you make edits.\
Lint errors also appear in the console.

### `pnpm preview`

This command runs the app in a local preview production build.

### `pnpm build`

This command creates an optimized production build of the app and places it in the `build` folder.
See this section about [Building for Production](https://vitejs.dev/guide/build.html) for more information.

### 'Regen graphql'

Edit .env.template and remove .template

npx -p @graphql-codegen/cli graphql-codegen --config gql_codegen.ts

### `pnpm tsc`

Compile typescript

### `pnpm oxlint`

Lint
