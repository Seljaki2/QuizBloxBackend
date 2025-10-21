import { Inject, Injectable } from '@nestjs/common';
import { FIREBASE_ADMIN } from './firebase.constants';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: admin.app.App,
  ) {}

  getAuth() {
    return this.firebaseApp.auth();
  }

  getStorage() {
    return this.firebaseApp.storage();
  }

  async verifyIdToken(idToken: string) {
    return this.getAuth().verifyIdToken(idToken);
  }
}
