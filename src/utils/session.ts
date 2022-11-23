import type { APIContext } from "astro";
import { config } from "../config";
import { createEncryptor } from "./symple-encryptor";

const secret = import.meta.env.COOKIE_SESSION_SECRET as string;
const cookieName = "mastodon-flock";

const initialSession: SessionProps = {
  twitterAccessToken: null,
  twitterOauthCodeVerifier: null,
  twitterOauthState: null,
};

export type SessionProps = {
  twitterAccessToken: string | null;
  twitterOauthCodeVerifier: string | null;
  twitterOauthState: string | null;
};

const enc = createEncryptor(secret);

export class Session {
  static withAstro(context: APIContext) {
    const sessionCookie = context.cookies.get(cookieName).value;
    if (sessionCookie) {
      return new Session(enc.decrypt(sessionCookie) as SessionProps, context);
    }

    return new Session(initialSession, context);
  }

  #astroContext: APIContext;
  #data: SessionProps;

  constructor(data: SessionProps, astroContext: APIContext) {
    this.#astroContext = astroContext;
    this.#data = data;
  }

  get(prop: keyof SessionProps) {
    return this.#data[prop];
  }

  set<K extends keyof SessionProps>(prop: K, value: SessionProps[K]) {
    this.#data[prop] = value;
    this.#save();
  }

  reset() {
    this.#data = initialSession;
    this.#save();
  }

  deleteCookie() {
    this.#astroContext.cookies.delete(cookieName);
  }

  #save() {
    this.#astroContext.cookies.set(cookieName, enc.encrypt(this.#data), {
      httpOnly: false,
      maxAge: 60 * 60,
      secure: !config.isLocal,
    });
  }
}
