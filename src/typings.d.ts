declare module 'gulp-clean' {
  export default function(): NodeJS.ReadWriteStream;
}

declare module 'gulp-file' {
  export default function(fileName: string, fileContent: string): NodeJS.ReadWriteStream;
}

declare interface IPermissionOptions {
  owner?: {
    read?: boolean,
    write?: boolean,
    execute?: boolean
  };
  group?: {
    read?: boolean,
    write?: boolean,
    execute?: boolean
  };
  others?: {
    read?: boolean,
    write?: boolean,
    execute?: boolean
  };
}

declare interface IPackageValidity {
  validForNewPackages: false;
  validForOldPackages: true;
  warnings: string [];
  errors: string[];
}

declare module 'gulp-chmod' {
  export default function(options: IPermissionOptions): NodeJS.ReadWriteStream;
}

declare module 'validate-npm-package-name' {
  export default function(packageName: string): IPackageValidity;
}

declare module 'gulp-filter' {
  export default function(glob: string|string[]): NodeJS.ReadWriteStream;
}
