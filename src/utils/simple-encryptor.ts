// Adapted from https://github.com/sehrope/node-simple-encryptor, MIT License
// Copyright (c) 2019 Sehrope Sarkuni

import crypto from "node:crypto";

// Arbitrary min length, nothing should shorter than this:
var MIN_KEY_LENGTH = 16;

type EncryptorOptions = {
  key: string;
  hmac?: boolean;
  reviver?: (this: any, key: string, value: any) => any;
};

export function createEncryptor(options: string | EncryptorOptions) {
  if (typeof options === "string") {
    options = {
      key: options,
      hmac: true,
    };
  }
  var key = options.key;
  var verifyHmac = options.hmac;
  var reviver = options.reviver;

  if (!key || typeof key !== "string") {
    throw new Error("a string key must be specified");
  }
  if (key.length < MIN_KEY_LENGTH) {
    throw new Error(`key must be at least ${MIN_KEY_LENGTH} characters long`);
  }
  if (
    reviver !== undefined &&
    reviver !== null &&
    typeof reviver !== "function"
  ) {
    throw new Error("reviver must be a function");
  }

  // Use SHA-256 to derive a 32-byte key from the specified string.
  // NOTE: We could alternatively do some kind of key stretching here.
  var cryptoKey = crypto.createHash("sha256").update(key).digest();

  // Returns the HMAC(text) using the derived cryptoKey
  // Defaults to returning the result as hex.
  function hmac(
    text: crypto.BinaryLike,
    format: crypto.BinaryToTextEncoding = "hex",
  ) {
    return crypto.createHmac("sha256", cryptoKey).update(text).digest(format);
  }

  // Encrypts an arbitrary object using the derived cryptoKey and returns the result as text.
  // The object is first serialized to JSON (via JSON.stringify) and the result is encrypted.
  //
  // The format of the output is:
  // [<hmac>]<iv><encryptedJson>
  //
  // <hmac>             : Optional HMAC
  // <iv>               : Randomly generated initialization vector
  // <encryptedJson>    : The encrypted object
  function encrypt(obj: any) {
    var json = JSON.stringify(obj);

    // First generate a random IV.
    // AES-256 IV size is sixteen bytes:
    var iv = crypto.randomBytes(16);

    // Make sure to use the 'iv' variant when creating the cipher object:
    var cipher = crypto.createCipheriv("aes-256-cbc", cryptoKey, iv);

    // Generate the encrypted json:
    var encryptedJson =
      cipher.update(json, "utf8", "base64") + cipher.final("base64");

    // Include the hex-encoded IV + the encrypted base64 data
    // NOTE: We're using hex for encoding the IV to ensure that it's of constant length.
    var result = iv.toString("hex") + encryptedJson;

    if (verifyHmac) {
      // Prepend an HMAC to the result to verify it's integrity prior to decrypting.
      // NOTE: We're using hex for encoding the hmac to ensure that it's of constant length
      result = hmac(result, "hex") + result;
    }

    return result;
  }

  // Decrypts the encrypted cipherText and returns back the original object.
  // If the cipherText cannot be decrypted (bad key, bad text, bad serialization) then it returns null.
  function decrypt(cipherText: string) {
    if (!cipherText) {
      return null;
    }

    if (verifyHmac) {
      // Extract the HMAC from the start of the message:
      var expectedHmac = cipherText.substring(0, 64);
      // The remaining message is the IV + encrypted message:
      cipherText = cipherText.substring(64);
      // Calculate the actual HMAC of the message:
      var actualHmac = hmac(cipherText);
      if (
        !crypto.timingSafeEqual(
          Buffer.from(actualHmac, "hex"),
          Buffer.from(expectedHmac, "hex"),
        )
      ) {
        throw new Error("HMAC does not match");
      }
    }

    // Extract the IV from the beginning of the message:
    var iv = Buffer.from(cipherText.substring(0, 32), "hex");
    // The remaining text is the encrypted JSON:
    var encryptedJson = cipherText.substring(32);

    // Make sure to use the 'iv' variant when creating the decipher object:
    var decipher = crypto.createDecipheriv("aes-256-cbc", cryptoKey, iv);
    // Decrypt the JSON:
    var json =
      decipher.update(encryptedJson, "base64", "utf8") + decipher.final("utf8");

    // Return the parsed object:
    return JSON.parse(json, reviver);
  }

  return {
    encrypt: encrypt,
    decrypt: decrypt,
    hmac: hmac,
  };
}
