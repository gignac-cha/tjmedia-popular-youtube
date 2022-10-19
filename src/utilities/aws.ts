import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { InvokeCommand, InvokeCommandOutput, LambdaClient } from '@aws-sdk/client-lambda';
import {
  CognitoIdentityCredentialProvider,
  fromCognitoIdentityPool,
} from '@aws-sdk/credential-provider-cognito-identity';

export type SearchParams = { [key: string]: boolean | number | string };

const region: string = 'ap-northeast-2';
const credentials: CognitoIdentityCredentialProvider = fromCognitoIdentityPool({
  client: new CognitoIdentityClient({ region }),
  identityPoolId: 'ap-northeast-2:33a232c6-3ee9-4e53-997e-da05dc9f5b0e',
});
const client = new LambdaClient({ region, credentials });

export const callLambdaFunction = async (FunctionName: string, searchParams: SearchParams): Promise<string> => {
  const Payload = new TextEncoder().encode(JSON.stringify({ searchParams }));
  const command = new InvokeCommand({ FunctionName, Payload });
  const output: InvokeCommandOutput = await client.send(command);
  return new TextDecoder('utf-8').decode(output.Payload);
};
