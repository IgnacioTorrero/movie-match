export interface Movie {
  id: number;
  title: string;
  director: string;
  year: number;
  genre: string;
  synopsis?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieWithUserRating extends Movie {
  userRating: number | string;
}
