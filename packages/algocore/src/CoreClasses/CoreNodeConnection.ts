import { NodeConnectionParams } from "../types";

export class CoreNodeConnection {
  params: NodeConnectionParams;

  constructor(params: NodeConnectionParams) {
    this.params = params;
  }

  get(): NodeConnectionParams {
    return this.params;
  }

  getId(): string {
    return this.params.id;
  }

  hasAlgodPort(): boolean {
    return Boolean(this.params.algod.port);
  }

  getAlgodUrl(): string {
    if (this.hasAlgodPort()) {
      return `${this.params.algod.url}:${this.params.algod.port}`;
    }

    return this.params.algod.url;
  }
}
