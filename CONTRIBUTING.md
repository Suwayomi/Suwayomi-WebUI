# Contributing
## Where should I start?
Everything from https://github.com/Suwayomi/Tachidesk-Server/blob/master/CONTRIBUTING.md#where-should-i-start applies here.

## About this project
This is a `create-react-app` project, you can find it's readme in [BUILDING.md](./BUILDING.md)

## Coding Style Guide
**Note:** Some of the bellow are new, refactor the code to match the style guide where you see inconsistency.
- Don't use relative imports.
- We are using MUI v5, the all stylings must be applied with the new system. 
- Never use the `style` prop, there's always a cleaner solution with `sx` or `styled`.
- Any new or changed string that might be shown to the user must be translated.
