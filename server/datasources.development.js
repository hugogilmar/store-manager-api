// Copyright IBM Corp. 2014. All Rights Reserved.
// Node module: loopback-example-offline-sync
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = {
  database: {
    connector: 'mysql',
    hostname: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  },
  mailer: {
    connector: 'mail',
    transports: [
      {
        type: process.env.MAILER_TYPE,
        host: process.env.MAILER_HOST,
        secure: process.env.MAILER_SECURE,
        port: process.env.MAILER_PORT,
        tls: {
          rejectUnauthorized: process.env.MAILER_TLS
        },
        auth: {
          user: process.env.MAILER_USERNAME,
          pass: process.env.MAILER_PASSWORD
        }
      }
    ]
  }
};
