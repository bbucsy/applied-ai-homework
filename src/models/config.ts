import { z } from "zod";
import yaml from "js-yaml";

const ConfigSchema = z.object({
  repos: z.string().array(),
  llama: z.object({
    model: z.string(),
    embeddingModel: z.string(),
    baseUrl: z.string(),
  }),
  chroma: z.object({
    url: z.string(),
    collection: z.string(),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

const baseConfig: Config = {
  repos: [
    "https://github.com/VoronDesign/Voron-Documentation.git",
    "https://github.com/VoronDesign/Voron-0.git",
  ],
  llama: {
    model: "llama3.2",
    embeddingModel: "mxbai-embed-large",
    baseUrl: "http://localhost:11434",
  },
  chroma: {
    url: "http://localhost:8080",
    collection: 'default'
  },
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
