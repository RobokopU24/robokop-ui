export const baseAPI = import.meta.env.VITE_BACKEND_API_URL;
export const baseAuthURL = `${baseAPI}/api`;

const authEndpoint = `${baseAuthURL}/auth`;
const authRoutes = {
  validateToken: `${authEndpoint}/validate-token`,
  github: `${authEndpoint}/github`,
  google: `${authEndpoint}/google`,
  login: `${authEndpoint}/login`,
  logout: `${authEndpoint}/logout`,
  magicLink: `${authEndpoint}/verification-link`,
  activateUserTokenHandler: `${authEndpoint}/activate-user-token`,
  activateNewUser: `${authEndpoint}/activate-new-user`,
};

const passkeyEndpoint = `${baseAuthURL}/passkeys`;
const passkeyRoutes = {
  base: passkeyEndpoint,
  list: `${passkeyEndpoint}/list`,
  generateRegistrationOptions: `${passkeyEndpoint}/generate-registration-options`,
  verifyRegistration: `${passkeyEndpoint}/verify-registration`,
  generateAuthenticationOptions: `${passkeyEndpoint}/generate-authentication-options`,
  verifyAuthentication: `${passkeyEndpoint}/verify-authentication`,
};

const queryEndpoint = `${baseAuthURL}/queries`;
const queryRoutes = {
  base: queryEndpoint,
  share: `${queryEndpoint}/share`,
};

const filesEndpoint = `${baseAuthURL}/files`;
export const fileRoutes = {
  base: filesEndpoint,
  fileSize: `${filesEndpoint}/file-size`,
};

export default { authRoutes, passkeyRoutes, queryRoutes, fileRoutes };
