import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
import { LambdaClient, InvokeCommand, InvokeCommandOutput } from '@aws-sdk/client-lambda';

export default class AWSClient {
  private client: LambdaClient;

  constructor(region: string) {
    this.client = new LambdaClient({
      region,
      credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({ region }),
        identityPoolId: 'ap-northeast-2:33a232c6-3ee9-4e53-997e-da05dc9f5b0e',
      }),
    });
  }
  async callLambdaFunction(FunctionName: string, searchParams: { [key: string]: boolean | number | string }): Promise<string> {
    const command = new InvokeCommand({
      FunctionName,
      Payload: new TextEncoder().encode(JSON.stringify({ searchParams })),
    });
    const data: InvokeCommandOutput = await this.client.send(command);
    return new TextDecoder('utf-8').decode(data.Payload);
  }
}
