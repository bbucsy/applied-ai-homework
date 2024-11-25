import yaml from "js-yaml";
import { z } from "zod";


const ConfigSchema = z.object({
  repos: z.string().array(),
  ollama: z.object({
    model: z.string(),
    embeddingModel: z.string(),
    baseUrl: z.string(),
  })
});

export type Config = z.infer<typeof ConfigSchema>;

const baseConfig: Config = {
  repos: [
    "https://github.com/VoronDesign/Voron-Documentation.git",
  ],
  llama: {
    model: "llama3.2",
    embeddingModel: "mxbai-embed-large",
    baseUrl: "http://localhost:11434",
  }
};

export const loadConfig = async (): Promise<Config> => {
  try {
    const path = "./.voronhelper.yaml";
    const file = Bun.file(path);
    const configText = await file.text();
    const yamlObject = yaml.load(configText);
    const config = ConfigSchema.default(baseConfig).parse(yamlObject);
    return config;
  } catch (error) {
    return baseConfig;
  }
};
