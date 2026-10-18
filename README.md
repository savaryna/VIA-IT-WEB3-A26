# WEB3 Assignments - Build an application for playing UNO

This repository contains the implementation of the assignments for the WEB3 course based on the requirements and tests provided by the instructor.

The implementation follows the [given rules](RULES.md) with the 2 player mode considered standard for the sake of this project.

## Assignment list

**Assignment 1 - 3:** Build the application using an **OO** approach. **Assignment 4 - 5:** Build the application using a **functional** approach.

1. [Create the game engine using interface + object literal in TypeScript](assignments/1.md)
2. [Create the user interface with Vue.js](assignments/2.md)
3. [Create the server with GraphQL](assignments/3.md)
4. Create the game engine using functional programming in TypeScript
5. Create the user interface with React, Redux and RxJS
6. Port the React application to Next.js

## Apps

First copy `apps/server/.env.example` to `apps/server/.env` and fill every setting, including a generated auth secret (see the [server setup](apps/server/README.md)). Then run these commands from the repository root in separate terminals, starting the server first:

```sh
pnpm dev:server
pnpm dev:client
```

Each process keeps its interactive terminal. Press Ctrl+C in its terminal to stop it.

- [Vue app](apps/vue/README.md)
- [GraphQL server](apps/server/README.md)

## Terminology

- **Room:** the server-managed session containing an owner, members in fixed seats, game settings, and lifecycle status. A room exists before its game starts and remains available after it finishes.
- **Lobby:** the shared waiting screen before a game starts and between rounds.
- **Game:** the engine's `Game`, started once per room. A single-round game ends after one round; a game played to a target score can contain several rounds. `GameMemento` stores the engine state needed to restore that game.
- **Round:** one deal, ending when a player plays their last card. `RoundMemento` stores that round's state and is included in `GameMemento`.

Players create or join a room, start a game, and play rounds. Game state is persisted automatically; rejoining restores the current round or between-rounds state. Returning to the room list closes the live connection but keeps the user's seat.

## Shared UI styles

[`@uno/ui`](packages/ui) exports shared CSS via `@uno/ui/styles.css`. All styles, including component and animation styles, live in CSS files under `packages/ui/src`; `styles.css` imports them. Components and interaction logic stay in each app. The package has no dependencies or build step.

## GraphQL types

Run `pnpm codegen` after changing `apps/server/src/graphql/schema.graphql` or `apps/vue/src/graphql/rooms.graphql`. `pnpm check` also regenerates types before checking.
