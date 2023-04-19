import { DIDDocument, DIDResolutionResult, DIDResolver, ServiceEndpoint, VerificationMethod } from 'did-resolver';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';

export interface TezosDIDResolverOptions {
  rpcUrl: string;
  network: 'mainnet' | 'testnet';
  contractAddress: string;
}

export function getResolver(options: TezosDIDResolverOptions): Record<string, DIDResolver> {
  const resolver = new TezosDIDResolver(options);
  return { tezos: resolver.resolve.bind(resolver) };
}

export class TezosDIDResolver {
  private tezos: TezosToolkit;
  private network: 'mainnet' | 'testnet';
  private contractAddress: string;

  constructor(options: TezosDIDResolverOptions) {
    this.tezos = new TezosToolkit(options.rpcUrl);
    this.network = options.network;
    this.contractAddress = options.contractAddress;
  }

  async resolve(did: string): Promise<DIDResolutionResult> {
    const didParts = did.split(':');
    if (didParts.length !== 4 || didParts[0] !== 'did' || didParts[1] !== 'tezos' || didParts[2] !== this.network) {
      throw new Error(`Invalid Tezos DID: ${did}`);
    }

    const address = didParts[3];

    const isDeactivated = await this.isDeactivated(address);

    if (!this.tezos.utils.checkAddress(address)) {
      throw new Error(`Invalid Tezos address: ${address}`);
    }

    const publicKey = await this.getPublicKeyForAddress(address);
    if (!publicKey) {
      return {
        didResolutionMetadata: {
          error: 'invalidDid',
        },
        didDocument: null,
        didDocumentMetadata: {},
      };
    }

    const didDocument: DIDDocument = {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: did,
      verificationMethod: [
        {
          id: `${did}#controller`,
          type: 'EcdsaSecp256k1VerificationKey2019',
          controller: did,
          publicKeyBase58: publicKey,
        },
      ],
      authentication: [`${did}#controller`],
      // service: [], // Add service endpoints if necessary
    };

    const didResolutionResult: DIDResolutionResult = {
      didResolutionMetadata: {
        contentType: 'application/did+ld+json',
      },
      didDocument: isDeactivated ? null : didDocument,
      didDocumentMetadata: isDeactivated ? { deactivated: true } : {},
    };

    return didResolutionResult;
  }

  private async getPublicKeyForAddress(address: string): Promise<string | null> {
    try {
      const account = await this.tezos.rpc.getContract(address);
      const publicKey = account.script.code.find((entry) => entry.prim === 'Pair').args[0].string;
      return publicKey;
    } catch (error) {
      return null;
    }
  }

  private async isDeactivated(address: string): Promise<boolean> {
    const contract = await this.tezos.contract.at(this.contractAddress);
    const storage = await contract.storage<{ didMapping: MichelsonMap<string, boolean> }>();
    return storage.didMapping.get(address) || false;
  }
}
