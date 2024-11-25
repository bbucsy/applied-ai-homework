import { v4 as uuidv4 } from "uuid";

import type { Config } from "../models/config";
import { getChatApp } from './chat-app';


export async function startChatLoop(config: Config): Promise<void> {

    const app = await getChatApp(config)
    const thread_id = uuidv4()


    const promptIndicator = ">>>";
    process.stdout.write(promptIndicator);

    // chat loop
    for await (const line of console) {
        if (line.toLowerCase() === '\\q' || line.toLowerCase() === '\\quit') {
            console.log('Good bye')
            break;
        }

        const stream = await app.streamEvents(
            { input: line },
            { version: 'v2', streamMode: 'messages', configurable: { thread_id } },
            { includeTypes: ['chat_model'] }
        );

        for await (const event of stream) {
            if (event.event == 'on_chat_model_stream') {
                process.stdout.write(event.data.chunk?.content);
            }
        }

        console.log()
        process.stdout.write(promptIndicator);
    }

}
