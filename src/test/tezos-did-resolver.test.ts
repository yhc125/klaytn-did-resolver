import { DIDResolutionResult, Resolver } from 'did-resolver';
import { getResolver as getTezosDIDResolver, TezosDIDResolverOptions } from '../tezos-did-resolver';

describe('tezos-did-resolver', () => {
  let mainnetDidResolver: Resolver;
  let testnetDidResolver: Resolver;

  beforeAll(() => {
    const mainnetConfig: TezosDIDResolverOptions = {
      rpcUrl: 'https://mainnet-tezos.giganode.io',
      network: 'mainnet',
      contractAddress: 'KT1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with actual contract address
    };

    const testnetConfig: TezosDIDResolverOptions = {
      rpcUrl: 'https://api.tez.ie/rpc/edonet',
      network: 'testnet',
      contractAddress: 'KT1YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY', // Replace with actual contract address
    };

    const mainnetDIDResolver = getTezosDIDResolver(mainnetConfig);
    const testnetDIDResolver = getTezosDIDResolver(testnetConfig);

    mainnetDidResolver = new Resolver({ ...mainnetDIDResolver });
    testnetDidResolver = new Resolver({ ...testnetDIDResolver });
  });

  // describe('Mainnet network', () => {
  //   it('resolves DID document', async () => {
  //     const did = 'did:tezos:mainnet:tz1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Replace with actual DID
  //     const didResolveRes: DIDResolutionResult = await mainnetDidResolver.resolve(did);

  //     console.log(JSON.stringify(didResolveRes, null, 3));
  //     expect(didResolveRes.didResolutionMetadata.contentType).toEqual('application/did+ld+json');
  //     expect(didResolveRes.didDocumentMetadata).toEqual({});

  //     if (didResolveRes.didDocument === null) {
  //       console.log("DID document is null");
  //     } else {
  //       expect(didResolveRes.didDocument.verificationMethod).toBeDefined();
  //     }
  //   });
  // });

  describe('Testnet network', () => {
    it('resolves DID document', async () => {
      const did = 'did:tezos:testnet:tz1YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY'; // Replace with actual DID
      const didResolveRes: DIDResolutionResult = await testnetDidResolver.resolve(did);

      console.log(JSON.stringify(didResolveRes, null, 3));
      expect(didResolveRes.didResolutionMetadata.contentType).toEqual('application/did+ld+json');
      expect(didResolveRes.didDocumentMetadata).toEqual({});

      if (didResolveRes.didDocument === null) {
        console.log("DID document is null");
      } else {
        expect(didResolveRes.didDocument.verificationMethod).toBeDefined();
      }
    });
  });
});
