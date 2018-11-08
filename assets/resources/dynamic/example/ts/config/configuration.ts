export interface Badge {
  imageUrl: string;
  title: string;
  redirectUrl: string;
}

export interface BadgeData {
  buildStatus: Badge;
  license: Badge;
  npmVersion: Badge;
}

export interface Configuration {
  title: string;
  logo: string;
  tagLine: string;
  configType: string;
  githubUrl: string;
  badges: BadgeData;
}
