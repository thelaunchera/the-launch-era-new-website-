const privateApp = 'https://self-love-gym-coach-desk-mab29i.v2.appdeploy.ai/';

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
