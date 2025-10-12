import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FIREBASE_ADMIN } from './firebase.constants';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FIREBASE_ADMIN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const saBase64 = config.get<string>('FIREBASE_SERVICE_ACCOUNT_BASE64');
        if(!saBase64)
          throw new Error("No firebase admin service account base64 string found!")
        const saJson = JSON.parse(Buffer.from(saBase64, 'base64').toString()) as admin.ServiceAccount;
        return admin.initializeApp({
          credential: admin.credential.cert(saJson)
        })
      }
    },
    FirebaseService
  ],
  exports: [FirebaseService]
})
export class FirebaseModule {}
