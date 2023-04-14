import { DIDDocument, DIDResolver, ServiceEndpoint, VerificationMethod } from 'did-resolver';
import Caver from 'caver-js';

export interface KlaytnDIDResolverOptions {
  rpcUrl: string;
}

export function getResolver(options: KlaytnDIDResolverOptions): Record<string, DIDResolver> {
  const resolver = new KlaytnDIDResolver(options);
  return { klaytn: resolver.resolve.bind(resolver) };
}

class KlaytnDIDResolver {
  private caver: Caver;

  constructor(options: KlaytnDIDResolverOptions) {
    this.caver = new Caver(options.rpcUrl);
  }

  async resolve(did: string): Promise<DIDDocument | null> {
    const didParts = did.split(':');
    if (didParts.length !== 3 || didParts[0] !== 'did' || didParts[1] !== 'klaytn') {
      throw new Error(`Invalid Klaytn DID: ${did}`);
    }

    const address = didParts[2];

    if (!this.caver.utils.isAddress(address)) {
      throw new Error(`Invalid Klaytn address: ${address}`);
    }

    const publicKey = await this.getPublicKeyForAddress(address);
    if (!publicKey) {
      return null;
    }

    const didDocument: DIDDocument = {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: did,
      verificationMethod: [
        {
          id: `${did}#controller`,
          type: 'EcdsaSecp256k1VerificationKey2019',
          controller: did,
          publicKeyHex: publicKey,
        },
      ],
      authentication: [`${did}#controller`],
      // service: [], // Add service endpoints if necessary
    };

    return didDocument;
  }

  private async getPublicKeyForAddress(address: string): Promise<string | null> {
    const account = await this.caver.rpc.klay.getAccount(address);
    if (!account) {
      return null;
    }

    const publicKey = this.caver.utils.xyPointFromPublicKey(account.key.publicKey);
    return publicKey;
  }
}
