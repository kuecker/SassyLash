/// <reference path="./.sst/platform/config.d.ts" />

// Infrastructure-as-code for the all-AWS deployment. Single DynamoDB table
// backs every entity; the Next.js app runs on Lambda + CloudFront via OpenNext.
// Cognito / SMS / cron components are added in later phases.
export default $config({
  app(input) {
    return {
      name: 'sassy',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      providers: { aws: { region: 'us-west-2' } },
    }
  },
  async run() {
    // Single-table design. GSIs back the app's access patterns (see lib/db/keys.ts).
    const table = new sst.aws.Dynamo('Sassy', {
      fields: {
        PK: 'string',
        SK: 'string',
        GSI1PK: 'string',
        GSI2PK: 'string',
        GSI2SK: 'string',
        GSI3PK: 'string',
        GSI3SK: 'string',
        GSI4PK: 'string',
        GSI4SK: 'string',
      },
      primaryIndex: { hashKey: 'PK', rangeKey: 'SK' },
      globalIndexes: {
        GSI1: { hashKey: 'GSI1PK' },                     // ref lookup
        GSI2: { hashKey: 'GSI2PK', rangeKey: 'GSI2SK' }, // by date
        GSI3: { hashKey: 'GSI3PK', rangeKey: 'GSI3SK' }, // by status
        GSI4: { hashKey: 'GSI4PK', rangeKey: 'GSI4SK' }, // by client
      },
    })

    // Single-owner auth. No client secret (public client) so the login route
    // can call InitiateAuth with USER_PASSWORD_AUTH. Create the one owner user
    // manually in the pool after first deploy.
    const userPool = new sst.aws.CognitoUserPool('Auth', {
      usernames: ['email'],
    })
    const userPoolClient = userPool.addClient('Web', {
      transform: {
        client: {
          explicitAuthFlows: ['ALLOW_USER_PASSWORD_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'],
        },
      },
    })

    const web = new sst.aws.Nextjs('Web', {
      link: [table],
      environment: {
        SASSY_TABLE: table.name,
        BUSINESS_TIMEZONE: process.env.BUSINESS_TIMEZONE ?? 'America/Denver',
        COGNITO_USER_POOL_ID: userPool.id,
        COGNITO_CLIENT_ID: userPoolClient.id,
        NEXT_PUBLIC_COGNITO_CLIENT_ID: userPoolClient.id,
        OWNER_EMAIL: process.env.OWNER_EMAIL ?? '',
        OWNER_PHONE_NUMBER: process.env.OWNER_PHONE_NUMBER ?? '',
        // Origination phone/pool id for AWS End User Messaging (set after
        // number registration clears — see plan §8).
        SMS_ORIGINATION_IDENTITY: process.env.SMS_ORIGINATION_IDENTITY ?? '',
        // Public site URL; set to the CloudFront domain after the first deploy.
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? '',
      },
      permissions: [
        { actions: ['sms-voice:SendTextMessage'], resources: ['*'] },
      ],
    })

    // Shared config for the backend Lambdas (cron + inbound SMS). They read the
    // table name from SASSY_TABLE and send SMS via End User Messaging.
    const backendEnv = {
      SASSY_TABLE: table.name,
      BUSINESS_TIMEZONE: process.env.BUSINESS_TIMEZONE ?? 'America/Denver',
      OWNER_PHONE_NUMBER: process.env.OWNER_PHONE_NUMBER ?? '',
      SMS_ORIGINATION_IDENTITY: process.env.SMS_ORIGINATION_IDENTITY ?? '',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? '',
    }
    const smsPermission = { actions: ['sms-voice:SendTextMessage'], resources: ['*'] }

    // Hourly expiry sweep (replaces the Vercel cron → /api/cron/expire).
    new sst.aws.Cron('Expire', {
      schedule: 'rate(1 hour)',
      function: {
        handler: 'functions/expire.handler',
        link: [table],
        environment: backendEnv,
        permissions: [smsPermission],
      },
    })

    // Inbound owner SMS replies. Point the End User Messaging two-way SMS
    // destination for the origination number at this topic ARN (manual step in
    // the EUM console — see plan §8). Replaces the Twilio HTTP webhook.
    const inboundTopic = new sst.aws.SnsTopic('InboundSms')
    inboundTopic.subscribe('Handler', {
      handler: 'functions/inbound-sms.handler',
      link: [table],
      environment: backendEnv,
      permissions: [smsPermission],
    })

    return {
      table: table.name,
      url: web.url,
      userPool: userPool.id,
      userPoolClient: userPoolClient.id,
      inboundTopic: inboundTopic.arn,
    }
  },
})
