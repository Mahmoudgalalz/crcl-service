import { firebase } from '../notification/firebase.service';

export async function checkUserExists(token: string) {
  try {
    const response = await firebase.auth().getUser(token);
    return { status: 'success', response };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}
