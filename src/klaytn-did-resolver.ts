import { DIDDocument, DIDResolutionResult, DIDResolver, ServiceEndpoint, VerificationMethod } from 'did-resolver';
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
		this.network = options.network;
  }

	async resolve(did: string): Promise<DIDResolutionResult> {
		const didParts = did.split(':');
		if (didParts.length !== 4 || didParts[0] !== 'did' || didParts[1] !== 'klaytn' || didParts[2] !== this.network) {
			throw new Error(`Invalid Klaytn DID: ${did}`);
		}
	
		const address = didParts[3];
	
		const isDeactivated = await this.isDeactivated(address);
		
		if (!this.caver.utils.isAddress(address)) {
			throw new Error(`Invalid Klaytn address: ${address}`);
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
					publicKeyHex: publicKey,
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
    const account = await this.caver.klay.getAccount(address);
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
      to: '0x88924D3A8259780E1E1EB3838813E9f3a0651403', // KlaytnDIDRegistryAddress
      data: this.caver.abi.encodeFunctionCall({
        name: 'isDeactivated',
        type: 'function',
        inputs: [{ type: 'address', name: 'didAddress' }],
      }, [address]),
    });

		const result = this.caver.abi.decodeParameter('bool', deactivated);

    return JSON.parse(result);
  }
}
