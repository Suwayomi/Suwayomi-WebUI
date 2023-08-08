# Contributing
## Where should I start?
Everything from https://github.com/Suwayomi/Tachidesk-Server/blob/master/CONTRIBUTING.md#where-should-i-start applies here.

## About this project
This is a `create-react-app` project, you can find it's readme in [BUILDING.md](./BUILDING.md)

## WebUI to [server](https://github.com/Suwayomi/Tachidesk-Server) mapping
### Explanation
For the server to be able to automatically download the latest compatible WebUI version, the [version to server version mapping file](versionToServerVersionMapping.json) has to be provided.<br/>

The order of the version mapping is important and has to be sorted by oldest WebUI version to latest version.<br/>
The latest version will always be `PREVIEW`.

### When to update
- changes get added that require a new minimum server version
    - **update:** the mapped server version for the `PREVIEW` version
- releasing a new version
    - **update:** in case the minimum server version has
        - not changed: the latest WebUI version mapping that is not the `PREVIEW` version has to be updated
        - changed: add a new entry below the `PREVIEW` version with the mapped server version from `PREVIEW`

## Coding Style Guide
**Note:** Some of the bellow are new, refactor the code to match the style guide where you see inconsistency.
- Don't use relative imports.
- We are using MUI v5, the all stylings must be applied with the new system. 
- Never use the `style` prop, there's always a cleaner solution with `sx` or `styled`.
- Any new or changed string that might be shown to the user must be translated.
