# @uno/engine

Shared UNO domain types and object-based game engine. See the [game rules](../../RULES.md).

The engine handles games and rounds; the server handles rooms, membership, and authentication. Engine commands act for the player in turn, so callers must check that the authenticated user controls that player before applying a command.

Mementos restore game state but do not preserve the random generator state for future shuffles.
