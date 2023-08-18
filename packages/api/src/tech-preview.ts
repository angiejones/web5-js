import type { DidIonCreateOptions, DidIonKeySet, DidService } from '@web5/dids';

import { DidIonMethod, utils as didUtils } from '@web5/dids';

/**
 * Generates two key pairs used for authorization and encryption purposes
 * when interfacing with DWNs. The IDs of these keys are referenced in the
 * service object that includes the dwnUrls provided.
 */
export async function generateDwnConfiguration(options: {
  dwnUrls: string[]
}): Promise<DidIonCreateOptions> {
  const { dwnUrls } = options;

  const signingKeyPair = await DidIonMethod.generateJwkKeyPair({
    keyAlgorithm : 'Ed25519',
    keyId        : '#dwn-sig'
  });

  const encryptionKeyPair = await DidIonMethod.generateJwkKeyPair({
    keyAlgorithm : 'Ed25519',
    keyId        : '#dwn-enc'
  });

  const keySet: DidIonKeySet = {
    verificationMethodKeys: [
      { ...signingKeyPair, relationships: ['authentication'] },
      { ...encryptionKeyPair, relationships: ['keyAgreement'] }
    ]
  };

  const services: DidService[] = [{
    'id'              : '#dwn',
    'type'            : 'DecentralizedWebNode',
    'serviceEndpoint' : {
      'nodes'          : dwnUrls,
      'signingKeys'    : ['#dwn-sig'],
      'encryptionKeys' : ['#dwn-enc']
    }
  }];

  return { keySet, services };
}

/**
 * Dynamically selects up to 2 DWN endpoints that are provided
 * by default during the Tech Preview period.
 */
export async function getTechPreviewDwnEndpoints(): Promise<string[]> {
  let response: Response;
  try {
    response = await fetch('https://dwn.tbddev.org/.well-known/did.json');
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
  } catch(error: any) {
    console.warn('failed to get tech preview dwn endpoints:', error.message);
    return [];
  }

  const didDocument = await response.json();
  const [ dwnService ] = didUtils.getServices({ didDocument, id: '#dwn', type: 'DecentralizedWebNode' });

  // allocate up to 2 nodes for a user.
  const techPreviewEndpoints = new Set<string>();

  if ('serviceEndpoint' in dwnService
      && !Array.isArray(dwnService.serviceEndpoint)
      && typeof dwnService.serviceEndpoint !== 'string'
      && Array.isArray(dwnService.serviceEndpoint.nodes)) {
    const dwnUrls = dwnService.serviceEndpoint.nodes;

    const numNodesToAllocate = Math.min(dwnUrls.length, 2);

    for (let attempts = 0; attempts < dwnUrls.length && techPreviewEndpoints.size < numNodesToAllocate; attempts += 1) {
      const nodeIdx = getRandomInt(0, dwnUrls.length);
      const dwnUrl = dwnUrls[nodeIdx];

      try {
        const healthCheck = await fetch(`${dwnUrl}/health`);
        if (healthCheck.ok) {
          techPreviewEndpoints.add(dwnUrl);
        }
      } catch(error: unknown) {
        // Ignore healthcheck failures and try the next node.
      }
    }
  }

  return Array.from(techPreviewEndpoints);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}