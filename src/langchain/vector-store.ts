
import type { Config } from "../models/config";
import { getEmbeddingModel } from "./embeddings";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { readdir } from "node:fs/promises";


const dirExsist = async (path: String): Promise<boolean> => {

    try {
        await readdir(`${path}`);
        return true
    } catch {
        return false
    }
}

export async function getVectorStore(config: Config) {

    const dir = './db/vectors'
    const embedding = getEmbeddingModel(config);

    if (await dirExsist(dir)) {
        console.log('Db found')
        return await HNSWLib.load(dir, embedding)
    }
    console.log('Db not found, creating new')

    return new HNSWLib(embedding, {
        space: 'cosine'
    });
}