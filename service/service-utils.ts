import Service, { Message } from 'webos-service';

type Response<T extends Record<string, any>> = T & {
  returnValue: true;
};

type Error<T extends Record<string, any>> = T & {
  returnValue: false;
  errorText: string;
};

export function makeSuccess<T>(payload: T): Response<T> {
  return { returnValue: true, ...payload };
}

export function makeError<T>(error: string, payload?: T): Error<T> {
  return { returnValue: false, errorText: error, ...payload };
}

/**
 * Thin wrapper that responds with a successful message or an error in case of a JS exception.
 */
export function tryRespond<T extends Record<string, any>>(runner: (message: Message) => Promise<T>) {
  return async (message: Message): Promise<void> => {
    try {
      const reply: T = await runner(message);
      message.respond(makeSuccess(reply));
    } catch (err) {
      message.respond(makeError(err.message));
    } finally {
      message.cancel({});
    }
  };
}

/**
 * Promisified luna call
 */
export function asyncCall<T extends Record<string, any>>(srv: Service, uri: string, args: Record<string, any>): Promise<T> {
  return new Promise((resolve, reject) => {
    srv.call(uri, args, ({ payload }) => {
      if (payload.returnValue) {
        resolve(payload as T);
      } else {
        reject(payload);
      }
    });
  });
}
