import { ChatOllama } from "@langchain/ollama";

import type { Config } from "../models/config";


export async function getLLM(config: Config) {
    return new ChatOllama({
        model: config.ollama.model,
        baseUrl: config.ollama.baseUrl,
        streaming: true
    })

}