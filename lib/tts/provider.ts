export interface TTSRequest {
  text: string;
  voice?: string;
  style?: string; // e.g., 'polite', 'casual', 'excited'
  activeModel?: string; // injected by registry when using 'random'
}

export interface TTSResponse {
  audioBase64: string;
  contentType: string;
}

export interface TTSProvider {
  generate(req: TTSRequest): Promise<TTSResponse>;
}

export abstract class BaseTTSProvider implements TTSProvider {
  abstract generate(req: TTSRequest): Promise<TTSResponse>;
}
