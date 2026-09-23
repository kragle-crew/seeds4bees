/**
 * The shared DynamoDB document client.
 *
 * Constructed once per container so warm invocations reuse the connection
 * rather than renegotiating TLS on every request.
 *
 * The AWS SDK v3 ships with the nodejs22.x runtime, so this adds nothing to
 * the deployment package.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const tableName = () => process.env.TABLE_NAME;
