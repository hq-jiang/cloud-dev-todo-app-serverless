// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '0f1asjki5e'
export const apiEndpoint = `https://${apiId}.execute-api.eu-central-1.amazonaws.com/dev` // "http://localhost:3003/dev" // 

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-kmdcgf-x.eu.auth0.com',            // Auth0 domain
  clientId: 'aCwMOQJKS9BPJWDkyOe3Alc2KE6E9Qty',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
