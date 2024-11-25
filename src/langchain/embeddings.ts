import { OllamaEmbeddings } from "@langchain/ollama";
import type { Config } from "../models/config";



export function getEmbeddingModel(config: Config) {
    return new OllamaEmbeddings({
        model: config.llama.embeddingModel,
        baseUrl: config.llama.baseUrl
    })
}