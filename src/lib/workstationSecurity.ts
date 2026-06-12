const credentialStorageKey = 'alchm-workstation-credential-id';

const toBase64Url = (value: ArrayBuffer) => {
  const bytes = new Uint8Array(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = window.atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const randomBytes = (length: number) => window.crypto.getRandomValues(new Uint8Array(length));

export const getStoredWorkstationCredential = () => window.localStorage.getItem(credentialStorageKey);

export const supportsPlatformBiometrics = async () => {
  if (!window.isSecureContext || !window.PublicKeyCredential) return false;
  return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
};

export const enrollPlatformBiometric = async () => {
  if (!window.isSecureContext || !window.PublicKeyCredential) {
    throw new Error('Platform biometric enrollment requires HTTPS or localhost.');
  }

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: 'Alchm ETHStation' },
      user: {
        id: randomBytes(16),
        name: 'hackstation-operator',
        displayName: 'HackStation Operator',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required',
      },
      timeout: 60_000,
      attestation: 'none',
    },
  });

  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error('No platform biometric credential was created.');
  }

  const encodedCredential = toBase64Url(credential.rawId);
  window.localStorage.setItem(credentialStorageKey, encodedCredential);
  return encodedCredential;
};

export const verifyPlatformBiometric = async (encodedCredential: string) => {
  if (!window.isSecureContext || !window.PublicKeyCredential) {
    throw new Error('Platform biometric unlock requires HTTPS or localhost.');
  }

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32),
      allowCredentials: [
        {
          id: fromBase64Url(encodedCredential),
          type: 'public-key',
          transports: ['internal'],
        },
      ],
      userVerification: 'required',
      timeout: 60_000,
    },
  });

  if (!(assertion instanceof PublicKeyCredential)) {
    throw new Error('Biometric verification did not complete.');
  }

  return assertion;
};

export const clearPlatformBiometric = () => {
  window.localStorage.removeItem(credentialStorageKey);
};

