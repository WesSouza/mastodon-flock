export type APerson = {
  id: string;
  type: "Person";
  preferredUsername?: string;
  name?: string;
  icon?: AImage;
  image?: AImage;
};

export type AImage = {
  type: "Image";
  mediaType?: string;
  url?: string;
};
