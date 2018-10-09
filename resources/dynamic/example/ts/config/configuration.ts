export interface Badge {
  imageUrl: string;
  title: string;
  redirectUrl: string;
}

export interface Configuration {
  title: string;
  logo: string;
  tagLine: string;
  configType: string;
  githubUrl: string;
  badges: {
    buildStatus: Badge;
    license: Badge;
    npmVersion: Badge;
  }
}
