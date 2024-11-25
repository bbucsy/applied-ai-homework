import { MultiFileLoader } from "langchain/document_loaders/fs/multi_file";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { readdirSync, statSync } from "fs";
import { join } from "path";

import { getVectorStore } from "./vector-store";
import type { Config } from "../models/config";


// Function to recursively find files
function findFiles(startPath: string, extensions: string[]): string[] {
    let results: string[] = [];
    const files = readdirSync(startPath);

    for (const file of files) {
        const filePath = join(startPath, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively search the directory
            results = results.concat(findFiles(filePath, extensions));
        } else if (extensions.some(ext => filePath.endsWith(ext))) {
            // Match files with the given extensions
            results.push(filePath);
        }
    }

    return results;
}


export async function loadDatabase(config: Config) {
    const foundFiles = findFiles('./data', ['.md', '.txt', '.csv'])


    const loader = new MultiFileLoader(
        foundFiles,
        {
            ".md": (path) => new TextLoader(path),
            ".txt": (path) => new TextLoader(path),
            ".csv": (path) => new CSVLoader(path),
        }
    );

    const docs = await loader.load();

    console.log(`Loaded ${docs.length} documents`);

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const splits = await textSplitter.splitDocuments(docs)

    console.log(`Split document into ${splits.length} parts`);

    const vectorStore = await getVectorStore(config);
    await vectorStore.addDocuments(splits)
    console.log('Uploading vector database: OK')

    await vectorStore.save('./db/vectors')
    console.log('Saving vector database: OK')
}