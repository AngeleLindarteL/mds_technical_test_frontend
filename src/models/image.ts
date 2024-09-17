export interface ImageI {
  type: Type;
  id: string;
  title: string;
  price: number;
  author: string;
  created_at: CreatedAt;
  main_attachment: MainAttachment;
  likes_count: number;
  liked: boolean;
  links: Link[];
}

export enum CreatedAt {
  The20121212T210820Z = "2012-12-12T21: 08: 20Z",
}

export interface Link {
  rel: Rel;
  uri: string;
  methods: Methods;
}

export enum Methods {
  Get = "GET",
  Post = "POST",
}

export enum Rel {
  Avatar = "avatar",
  Like = "like",
}

export interface MainAttachment {
  big: string;
  small: string;
}

export enum Type {
  Image = "Image",
}
