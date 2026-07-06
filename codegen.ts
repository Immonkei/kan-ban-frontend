import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",

  documents: [
    "src/**/*.graphql",
  ],

  generates: {
    "./src/gql/": {
      preset: "client",
    },
  },

  ignoreNoDocuments: true,
};

export default config;