import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { readdir } from "node:fs/promises";

import { getEmbeddingModel } from "./embeddings";
import type { Config } from "../models/config";


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
        return await HNSWLib.load(dir, embedding)
    }

    return new HNSWLib(embedding, {
        space: 'cosine'
    });
}