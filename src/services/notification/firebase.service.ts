import admin from 'firebase-admin';
import path from 'path';

export const firebase = admin.initializeApp({
  credential: admin.credential.cert(
    path.join(__dirname, '../../../../crcl-firebase.json'),
  ),
});

export async function sendNotificationToDevice(
  token: string,
  payload: { title: string; body: string },
) {
  const message = {
    notification: payload,
    token,
  };

  try {
    const response = await admin.messaging().send(message);
    return { status: 'success', response };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

export async function sendNotificationToMultipleDevices(
  tokens: string[],
  payload: { title: string; body: string },
) {
  const message = {
    notification: payload,
    tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    const failedTokens = response.responses
      .filter((res) => !res.success)
      .map((_, index) => tokens[index]);

    return {
      status: 'success',
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens,
    };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

export async function sendNotificationToTopic(
  topic: string,
  payload: { title: string; body: string },
) {
  const message = {
    notification: payload,
    topic,
  };

  try {
    const response = await admin.messaging().send(message);
    return { status: 'success', response };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

export async function subscribeUserToTopic(token: string, topic: string) {
  try {
    const response = await admin.messaging().subscribeToTopic(token, topic);
    return { status: 'success', response };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

export async function unsubscribeUserFromTopic(token: string, topic: string) {
  try {
    const response = await admin.messaging().unsubscribeFromTopic(token, topic);
    return { status: 'success', response };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

export async function subscribeMultipleUsersToTopic(
  tokens: string[],
  topic: string,
) {
  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    return { status: 'success', response };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}

export async function unsubscribeMultipleUsersFromTopic(
  tokens: string[],
  topic: string,
) {
  try {
    const response = await admin
      .messaging()
      .unsubscribeFromTopic(tokens, topic);
    return { status: 'success', response };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}
