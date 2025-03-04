import admin from 'firebase-admin';
import path from 'path';

admin.initializeApp({
  credential: admin.credential.cert(
    path.join(__dirname, '../../../../crcl-firebase.json'),
  ),
});

export async function checkUserExists(token: string) {
  try {
    const response = await admin.auth().getUser(token);
    return { status: 'success', response };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}
