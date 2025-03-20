# Suwayomi-WebUI
This is the repository of the default client of [Suwayomi-Server](https://github.com/Suwayomi/Suwayomi-Server).

The server has this web app bundled by default and is able to automatically update to the latest versions.
Thus, there is no need to manually download any builds unless you want to host the app yourself instead of having it hosted by the Suwayomi-Server.

## Features
- Library management
  - Library page - manga management
    - Filter/Sort/Search your manga
    - Use categories to categorize your manga
    - Select manga in your library and perform actions (e.g. download, change categories, mark as read, ...) on one or multiple manga
  - Manga page - chapter management
    - Filter/Sort the chapter list
    - Select chapters and perform actions (e.g. download, bookmark, mark as read, ...) on one or multiple manga
  - Select a range of manga/chapters by using shift + left click or long press
  - Overview of duplicated manga in your library (settings > library)
- Reader
  - Desktop and Mobile UI (**preview only**)
  - Default settings per reading mode (**preview only**)
  - Settings per manga
  - Reading modes (Single/Double Page, Continuous Vertical/Horizontal, Webtoon)
  - Page scale modes (limit by width/height/screen, scale small pages, custom reader width) (**preview only**)
  - Image filters (**preview only**)
  - Customizable keybinds (**preview only**)
  - Auto scrolling (**preview only**)
  - Infinite chapter scrolling (**preview only**)
  - Option to ignore duplicated chapters while reading
  - Option to automatically download next chapters while reading
  - Option to automatically delete downloaded chapters after reading them
  - ...
- Download queue
- Reading history (**preview only (rudimentary)**)
- Settings per device (e.g. different reader settings for pc, phone and tablet)
- Sources
  - Migration of manga between sources
  - Hide in library manga while browsing sources
  - Save source searches to easily reuse them
  - Duplication check when adding a new manga to your library
  - Quick add/remove a manga to your library in the source browse (hover with mouse on pc or long press on touch devices)
- App updates
  - Inform about available WebUI and Server updates
  - Inform about successful WebUI and Server updates since the last time the app was used
- Themes (**preview only**)
  - Use predefined themes
  - Create your own themes
  - Dynamic theme on manga pages

## Preview
An ongoing changelog of all relevant changes since the last stable release can be found [here](https://github.com/Suwayomi/Suwayomi-WebUI/issues/749)

To use the preview version you can select the PREVIEW channel in the settings of your Suwayomi-Server.
The server is then able to download and also keep the version automatically up-to-date.

Keep in mind that the preview version might need a newer version than the stable server.
In case your server is outdated, it will automatically downgrade to the latest compatible WebUI version.

Minified builds of WebUI can be found here [Suwayomi-WebUI-preview](https://github.com/Suwayomi/Suwayomi-WebUI-preview).

Additionally, there is an online build of the WebUI preview version that is available [here](https://suwayomi-webui-preview.github.io/).
*Make sure to set your Suwayomi-Server hostname in Settings or you'll get infinite loading.* Also note that its the **latest** revision of WebUI and might not work correctly if you connect to a stable build of Suwayomi-Server.

## Contributing and Technical info
See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Translation
Feel free to translate the project on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/)

<details><summary>Translation Progress</summary>
<a href="https://hosted.weblate.org/engage/suwayomi-webui/">
<img src="https://hosted.weblate.org/widgets/suwayomi/-/suwayomi-webui/multi-auto.svg" alt="Translation status" />
</a>
</details>

## License

    Copyright (C) Contributors to the Suwayomi project

    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
