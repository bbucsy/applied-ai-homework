# Voron AI

A simple CLI based AI assistant for Voron 3D printers.
It uses RAG to source context from the [VoronDocumentation](https://github.com/VoronDesign/Voron-Documentation) repo.

To use this program, you will need [Bun](https://bun.sh) and an [Ollama](https://ollama.com/) server.

To configure the models used, and the server, create a `.voronhelper.yaml` based on the example.

## How to use it

1) First install dependencies with bun `bun install`
2) Then run the cli. It will give you a small help screen : `bun run src/index.ts`

3) Clone the voron documentation with `bun run src/index.ts pull`

4) Create a local vector database from the documentation: `bun run src/index.ts parse`

5)   You can do a similarity search in the db with `bun run src/index.ts search <query>`

6) Start the interactive chatbot with `bun run src/index.ts chat`
