import { DIDDocument, DIDResolver, ServiceEndpoint, VerificationMethod } from 'did-resolver';
import Caver, { PublicKeyForRPC } from 'caver-js';

export interface KlaytnDIDResolverOptions {
  rpcUrl: string;
	network: 'baobab' | 'cypress';
}

export function getResolver(options: KlaytnDIDResolverOptions): Record<string, DIDResolver> {
  const resolver = new KlaytnDIDResolver(options);
  return { klaytn: resolver.resolve.bind(resolver) };
}

export class KlaytnDIDResolver {
  private caver: Caver;
	private network: 'baobab' | 'cypress';

  constructor(options: KlaytnDIDResolverOptions) {
    this.caver = new Caver(options.rpcUrl);
  }

  async resolve(did: string): Promise<DIDDocument | null> {
    const didParts = did.split(':');
		if (didParts.length !== 4 || didParts[0] !== 'did' || didParts[1] !== 'klaytn' || didParts[2] !== this.network) {
      throw new Error(`Invalid Klaytn DID: ${did}`);
    }

		 const address = didParts[3];

		if (await this.isDeactivated(address)) {
      return null; // Return null if the DID is deactivated
    }

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

    // Check if the account key is of type AccountKeyPublic
    if (account.accType !== 2) {
        return null;
    }

    // Extract the public key from the AccountKeyPublic object
    const publicKeyForRPC = account.account.key as PublicKeyForRPC;
    const publicKey = publicKeyForRPC.x + publicKeyForRPC.y;
    return publicKey;
	}


	private async isDeactivated(address: string): Promise<boolean> {
    // Replace the following line with the actual call to the smart contract
    const deactivated = await this.caver.rpc.klay.call({
      to: 'KlaytnDIDRegistryAddress', // Replace this with the actual contract address
      data: this.caver.abi.encodeFunctionCall({
        name: 'isDeactivated',
        type: 'function',
        inputs: [{ type: 'address', name: 'didAddress' }],
      }, [address]),
    });

    return this.caver.abi.decodeParameter('bool', deactivated);
  }
}
