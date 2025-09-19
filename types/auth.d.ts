declare module "bcryptjs" {
  export function hash(data: string, saltOrRounds: number): Promise<string>
  export function compare(data: string, encrypted: string): Promise<boolean>
}

declare module "jsonwebtoken" {
  export interface JwtPayload {
    sub?: string
    [key: string]: any
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string,
    options?: { expiresIn?: string | number },
  ): string

  export function verify(token: string, secretOrPublicKey: string): JwtPayload | string
}
