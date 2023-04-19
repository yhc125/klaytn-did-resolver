import { DIDResolutionResult, Resolver } from 'did-resolver';
import { getResolver as getKlaytnDIDResolver, KlaytnDIDResolverOptions } from '../klaytn-did-resolver';

describe('klaytn-did-resolver', () => {


	let baobabDidResolver: Resolver;
  let cypressDidResolver: Resolver;
	
  beforeAll(() => {
    const baobabConfig: KlaytnDIDResolverOptions = {
      rpcUrl: 'https://api.baobab.klaytn.net:8651',
      network: 'baobab',
			contractAddress: '0xf7C4A040d44cA56C3cc8FAAA3A801b89DD936671',
    };

    const cypressConfig: KlaytnDIDResolverOptions = {
      rpcUrl: 'https://api.cypress.klaytn.net:8651',
      network: 'cypress',
			contractAddress: '',
    };

    const baobabDIDResolver = getKlaytnDIDResolver(baobabConfig);
    const cypressDIDResolver = getKlaytnDIDResolver(cypressConfig);

    baobabDidResolver = new Resolver({ ...baobabDIDResolver });
    cypressDidResolver = new Resolver({ ...cypressDIDResolver });
  });

  describe('Baobab network', () => {
    it('resolves DID document', async () => {
      const did = 'did:klaytn:baobab:0xA738931B9Dd4019D282D9cf368644fEc52e9ec58';
      const didResolveRes: DIDResolutionResult = await baobabDidResolver.resolve(did);

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

  // describe('Cypress network', () => {
  //   it('resolves DID document', async () => {
  //     const did = 'did:klaytn:cypress:0xA57d85F38d6Ef66aBBb3088A32532Ea6884FF6C3';
  //     const didResolveRes: DIDResolutionResult = await cypressDidResolver.resolve(did);

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
});
