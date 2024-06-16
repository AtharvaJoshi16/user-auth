export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      BASE_URL: string;
      HOST: string;
      PORT: string;
      DATABASE_URL: string;
      SERVICE_EMAIL: string;
      SERVICE_PASSWORD: string;
      JWT_KEY: string;
      // add more environment variables and their types here
    }
  }
}
