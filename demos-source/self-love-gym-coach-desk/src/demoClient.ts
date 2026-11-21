const privateApp = 'https://thelaunchera.com/apps/self-love-gym/';

export const auth = {
  getUser: async () => null,
  signInWithRedirect: async () => {
    window.location.assign(privateApp);
  },
  signOut: async () => undefined,
};

export const api = {
  get: async () => { throw new Error('Demo has no private server.'); },
  put: async () => { throw new Error('Demo has no private server.'); },
};
