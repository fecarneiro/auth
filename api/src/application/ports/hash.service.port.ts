export interface HashServicePort {
  compare(plain: string, hash: string): Promise<boolean>;
}
