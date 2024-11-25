import { Command } from "commander";
import { $ } from "bun";

import { getVectorStore } from "./langchain/vector-store";
import { startChatLoop } from "./langchain/chat-loop";
import { loadDatabase } from "./langchain/db-upload";
import { loadConfig } from "./models/config";


const program = new Command();
const config = await loadConfig();

program
  .name("voron-ai")
  .description("CLI chat-bot for easy querying Voron documentations")
  .version("0.0.1");

program
  .command('config')
  .description('Prints program configurations')
  .action(() => {
    console.log("Configuration", config)
  })


program
  .command("pull")
  .description(
    "Pulls voron documentations from githb repos specified '.voronhelper.yaml'"
  )
  .action(async () => {
    console.log('Cloning documentation repos')
    for (const repo of config.repos) {
      await $`cd data && git clone ${repo}`
    }
  });


program
  .command('parse')
  .description('Parses all `.md` and `.pdf` files, and stores them in the configured vector database')
  .action(async () => {
    await loadDatabase(config);
  })

program
  .command('search')
  .argument('<query>', 'A search query string to run in the vector database')
  .description('Does a similarity search in the configured vector database')
  .action(async (query: string) => {
    console.log(`searching for "${query}"`)
    const vectorStore = await getVectorStore(config);
    const similaritySearchResults = await vectorStore.similaritySearch(query)

    for (const doc of similaritySearchResults) {
      console.log(`* ${doc.pageContent} [${JSON.stringify(doc.metadata, null)}]`);
    }
  })

program
  .command('chat')
  .description('Starts an interactive chat with an AI Voron assitant')
  .action(async () => {
    await startChatLoop(config)
  })

program.parse();
