export interface IJokeStreamReq {
  jokeStreamId: string;
  clientId: string;
}

export interface IJoke {
  joke: string;
  fromClientId: string;
}

export interface IClient {
  name: string;
  id: string;
}
