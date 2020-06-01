import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Lambda-auth0Authorizer')

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJQp+sKnCVi3p9MA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1rbWRjZ2YteC5ldS5hdXRoMC5jb20wHhcNMjAwNTIyMTI1MjMxWhcN
MzQwMTI5MTI1MjMxWjAkMSIwIAYDVQQDExlkZXYta21kY2dmLXguZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu7d9nE/H7xWbFtoC
Z3eADvwdOczuTzuPvO1awfvBsigfaZVsI1yHdpYwx/WC2XMtP5aYOuk58vOWd3nt
Qi7yCPlIbZQPwtmc+NhnAAYyrWCzto0phl2PdyMcMgWBVkk8ZjPZIKqu72cLPoHp
xLc3f/cS811PR9Oa9TEBfbYWrSDLtMnHcNhhbecPbXGzsiV9R3NkyrqHVwE0zdwQ
WIE7ZppRzd+2fL5D5cmFtYqHpIVyb6PW16nENla2D0JxlK91xPOt0amn2GVt3WA8
XKGTjB7uJZTlY2I5Xfq5HNvaDPBRJLSzdD1mmUnmE4S2TWSgqg1mUvLLJLfAmNvB
FRYWFwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRitf6is1Jv
Xj6qrG+KCQU17IGR9zAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AJjluGbH4G7Gsk+SdIfimBLx8alv5TEQ0x0lL+42I3kSET3DSyh+Zrkfyi5BIKoP
FO+8eTclu6qImCDNkNFUS9vjtic66EMZPMMcFJNMamwfklpzfE2/IVc39S/6+Wck
kBOQnRiVNHnNok7IcvAck0mX2gTcbnXzpRirEFs+EnSYKSXRiwa1SVCZcT8C5M2K
pC04yq4XiTgRZRbY5p/2rtZARI8KM426XmWXS9KCuBpzA+lOS6Skv56VCJwI2MeY
t+DajEDD/S/dxi6p7FDOBklQ52N5DwzQGtK4veHm94OM1LECZ2P/mxpJCsssdZW3
hcERnNQfuVSHgC0SpqmTQAQ=
-----END CERTIFICATE-----`;

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

  const header : string = event.authorizationToken;
  const split = header.split(' ')
  const token = split[1]

  try {
    
    const decodedToken = verify(
      token,           // Token from an HTTP header to validate
      cert,            // A certificate copied from Auth0 website
      { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
    ) as JwtPayload

    logger.info('User was authorized', decodedToken);

    return {
      principalId: decodedToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch(error) {
    logger.info('User was not authorized', error.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}