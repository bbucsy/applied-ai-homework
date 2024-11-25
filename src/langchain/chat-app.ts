import { Annotation, messagesStateReducer, StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { v4 as uuidv4 } from "uuid";

import contextPropmtText from '../prompts/context.txt' with { type: "file" };
import systemPromptText from '../prompts/system.txt' with { type: "file" };
import { getVectorStore } from "./vector-store";
import type { Config } from "../models/config";
import { getLLM } from "./llm";


export async function getChatApp(config: Config) {
    const retriever = (await getVectorStore(config)).asRetriever();
    const llm = await getLLM(config);


    const contextualizeQSystemPrompt = await Bun.file(contextPropmtText).text()
    const systemPrompt = await Bun.file(systemPromptText).text()

    const chatPrompt = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
    ]);

    const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
        ["system", contextualizeQSystemPrompt],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
    ]);

    const historyAwareRetriever = await createHistoryAwareRetriever({
        llm,
        retriever,
        rephrasePrompt: contextualizeQPrompt,
    });

    const questionAnswerChain = await createStuffDocumentsChain({
        llm: llm,
        prompt: chatPrompt,
    });

    const ragChain = await createRetrievalChain({
        retriever: historyAwareRetriever,
        combineDocsChain: questionAnswerChain,
    });

    // Define the State interface
    const GraphAnnotation = Annotation.Root({
        input: Annotation<string>(),
        chat_history: Annotation<BaseMessage[]>({
            reducer: messagesStateReducer,
            default: () => [],
        }),
        context: Annotation<string>(),
        answer: Annotation<string>(),
    });

    async function callModel(state: typeof GraphAnnotation.State) {
        const response = await ragChain.withConfig({ runName: 'runxd' }).invoke(state);
        return {
            chat_history: [
                new HumanMessage(state.input),
                new AIMessage(response.answer),
            ],
            context: response.context,
            answer: response.answer,
        };
    }

    const workflow = new StateGraph(GraphAnnotation)
        .addNode("model", callModel)
        .addEdge(START, "model")
        .addEdge("model", END);

    const memory = new MemorySaver();
    const app = workflow.compile({ checkpointer: memory });

    return app
}