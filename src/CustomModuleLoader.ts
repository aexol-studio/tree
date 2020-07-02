import customModuleLoader = require("module");

export class CustomModuleLoader {
  public cOptions: any = require("../tsconfig.json").compilerOptions;

  public replacePaths: any = {};

  constructor() {
    Object.keys(this.cOptions.paths).forEach((alias) => {
      this.replacePaths[alias.replace(/\*.?/, "(.*)")] = this.cOptions.paths[
        alias
      ][0].replace(/\*.?/, "$1");
    });

    (<any>customModuleLoader)._originalResolveFilename = (<any>(
      customModuleLoader
    ))._resolveFilename;

    (<any>customModuleLoader)._resolveFilename = (
      request: string,
      parent: customModuleLoader,
      isMain: boolean
    ) => {
      Object.keys(this.replacePaths).forEach((matchString) => {
        const regex = new RegExp(matchString);
        if (request.match(regex)) {
          request = [
            process.cwd(),
            this.cOptions.outDir,
            request.replace(regex, this.replacePaths[matchString]),
          ].join("/");
        }
      });
      return (<any>customModuleLoader)._originalResolveFilename(
        request,
        parent,
        isMain
      );
    };
  }
}
