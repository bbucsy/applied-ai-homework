import { OllamaEmbeddings } from "@langchain/ollama";

import type { Config } from "../models/config";


export function getEmbeddingModel(config: Config) {
    return new OllamaEmbeddings({
        model: config.ollama.embeddingModel,
        baseUrl: config.ollama.baseUrl
    })
}