import { DIDResolutionResult, Resolver } from 'did-resolver';
import { getResolver as getKlaytnDIDResolver } from './klaytn-did-resolver';

describe('klaytn-did-resolver', () => {
  const baobabConfig = {
    rpcUrl: 'https://api.baobab.klaytn.net:8651',
    network: 'baobab',
  };

  const cypressConfig = {
    rpcUrl: 'https://api.cypress.klaytn.net:8651',
    network: 'cypress',
  };

  const baobabDIDResolver = getKlaytnDIDResolver(baobabConfig);
  const cypressDIDResolver = getKlaytnDIDResolver(cypressConfig);

  const baobabDidResolver = new Resolver({ ...baobabDIDResolver });
  const cypressDidResolver = new Resolver({ ...cypressDIDResolver });

  describe('Baobab network', () => {
    it('resolves DID document', async () => {
      const did = 'did:klaytn:baobab:0x742d35Cc6634C0532925a3b84c9B233fA1A403b';
      const didResolveRes: DIDResolutionResult = await baobabDidResolver.resolve(did);

      console.log(JSON.stringify(didResolveRes, null, 3));
      expect(didResolveRes.didResolutionMetadata.contentType).toEqual('application/did+ld+json');
      expect(didResolveRes.didDocumentMetadata).toEqual({});
      expect(didResolveRes.didDocument.verificationMethod).toBeDefined();
    });
  });

  describe('Cypress network', () => {
    it('resolves DID document', async () => {
      const did = 'did:klaytn:cypress:0x742d35Cc6634C0532925a3b84c9B233fA1A403b';
      const didResolveRes: DIDResolutionResult = await cypressDidResolver.resolve(did);

      console.log(JSON.stringify(didResolveRes, null, 3));
      expect(didResolveRes.didResolutionMetadata.contentType).toEqual('application/did+ld+json');
      expect(didResolveRes.didDocumentMetadata).toEqual({});
      expect(didResolveRes.didDocument.verificationMethod).toBeDefined();
    });
  });
});
