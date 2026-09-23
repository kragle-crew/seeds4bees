/** Persistence for the site-wide visit tally. */

import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { documentClient, tableName } from '../dynamo.mjs';

const VISIT_COUNTER_KEY = { pk: 'stats', sk: 'visits' };

/**
 * Records one visit and returns the new total.
 *
 * DynamoDB's ADD treats a missing attribute as zero, so no seed row is
 * needed, and the increment stays atomic under concurrent requests.
 */
export async function recordVisit() {
  const result = await documentClient.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: VISIT_COUNTER_KEY,
      UpdateExpression: 'ADD #count :increment',
      ExpressionAttributeNames: { '#count': 'count' },
      ExpressionAttributeValues: { ':increment': 1 },
      ReturnValues: 'UPDATED_NEW',
    }),
  );

  return result.Attributes?.count ?? 0;
}
