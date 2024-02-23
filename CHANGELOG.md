# v1.0.0 (r1411)
## New
### General
- added internationalization (help translating on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/))
- get notified when a new server version has been released
- manually check for new versions (server and webUI)

### Download
- download ahead: automatically download next unread chapters while reading (requires the current and next chapters to be downloaded)
- automatically delete downloaded chapters after reading
- automatically delete downloaded chapters when manually marking them as read
- prevent automatic deletion of bookmarked chapters

### Library
- migrate manga between sources
- improved library management (single and bulk actions)
  - download
  - delete
  - mark as read
  - mark as unread
  - migrate (single action only)
  - change categories
  - remove from library
- search by genre (`genre1, genre2 genre3, ...`, e.g.: `action, adventure, fantasy`)
- sort options
  - by last read
  - by latest fetched chapter
  - by latest uploaded chapter
- show number of manga in whole library and each category (these numbers are based on category manga and will include non library manga)
- optional continue read button

### Reader
- settings
  - skip duplicate chapters (opens the previous/next chapter from the same scanlator as the current one if it exists)
  - fit page to window
  - scale small pages (only when "fit page to window" is enabled)
  - reader width (only when "fit page to window" is disabled)
  - double page mode: offset first page
- retry failed image requests button

### Settings
- server settings can now be changed from the UI

## Bug fixes
- a lot (and added new ones for the future, lul)

## Translations
Feel free to translate the project on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/).

Thank you for your contribution to the translation of the project.

- (added) Arabic

  - abdelbasset jabrane
  - Bander AL-shreef
  - caref


- (added) Chinese (Simplified)

  - misaka10843
  - 蓝云Reyes
  - Nite07
  - 志明
  - ccms
  - 宮河ひより
  - 清水汐音
  - DevCoz
  - guohuageng
  - 娃哈哈
  - Yuhyeong
  - QuietBlade


- (added) Chinese (Traditional)

  - plum7x
  - 蓝云Reyes


- (added) French

  - Nathan
  - Alexandre Journet
  - anvstin
  - Ibaraki Douji


- (added) German

  - Fumo Vite
  - 志明


- (added) Indonesian

  - Rafie Rafie


- (added) Italian

  - Wip -Sama (Wip-Sama SmasterMega)


- (added) Japanese

  - Super Mario


- (added) Korean

  - jun
  - Deleted User


- (added) Portuguese

  - Shinzo wo name


- (added) Spanish

  - gallegonovato
  - Yon
  - Fordas
  - Carlos Nahuel Morocho
  - PedroJLR


- (added) Ukrainian

  - Dan


- (added) Vietnamese

  - xconkhi9x
  - 志明

## Full Changelog
- ([r1410](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e34a30a79b16db474d2aa843d7774deb73774b1d)) Translations update from Hosted Weblate ([#589](https://github.com/Suwayomi/Suwayomi-WebUI/pull/589) by @weblate, @jesusFx, @QuietBlade, @anvstin, @guohuageng, @plum7x, @HiyoriTUK, @aizhimoran)
- ([r1409](https://github.com/Suwayomi/Suwayomi-WebUI/commit/21bb931a74155a75b14fb4c307dcd18108a3de09)) Use full available width for reader component ([#618](https://github.com/Suwayomi/Suwayomi-WebUI/pull/618) by @schroda)
- ([r1408](https://github.com/Suwayomi/Suwayomi-WebUI/commit/629b742140e21ab7cd51abd947f32b8d6dc54780)) Feature/settings add new socks proxy settings ([#617](https://github.com/Suwayomi/Suwayomi-WebUI/pull/617) by @schroda)
- ([r1407](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ab0ecf4da0a2511fd0a8d8885bce07e53dfd5840)) Center page number correctly ([#616](https://github.com/Suwayomi/Suwayomi-WebUI/pull/616) by @schroda)
- ([r1406](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ceec260d14d4c48d0c5f8b093af7039e849cd304)) Feature/reader setting add scale small pages ([#615](https://github.com/Suwayomi/Suwayomi-WebUI/pull/615) by @schroda)
- ([r1405](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9531825babc7f4ccc28c3a84022d6ef0aa01ff22)) Fix size of pages in continues reader mode ([#613](https://github.com/Suwayomi/Suwayomi-WebUI/pull/613) by @schroda)
- ([r1404](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d8ee676d550b677a11568773065e7254b2f12096)) Prevent invisible pages ([#614](https://github.com/Suwayomi/Suwayomi-WebUI/pull/614) by @schroda)
- ([r1403](https://github.com/Suwayomi/Suwayomi-WebUI/commit/97ab4004a61b243cc3420818488e9685728315ce)) Do not update chapter in case it has not been loaded yet ([#612](https://github.com/Suwayomi/Suwayomi-WebUI/pull/612) by @schroda)
- ([r1402](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5a9618aefe6876b1b9cab8660ac05202cbb6bafa)) Correctly update function refs when state changes ([#611](https://github.com/Suwayomi/Suwayomi-WebUI/pull/611) by @schroda)
- ([r1401](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e8bfc28350328776f379cde1cb48e3c83d88bf87)) [VersionMapping] Require server version "r1487" for preview ([#610](https://github.com/Suwayomi/Suwayomi-WebUI/pull/610) by @schroda)
- ([r1400](https://github.com/Suwayomi/Suwayomi-WebUI/commit/02dc9ca7365f96d0ab2ad61bfb5c1b0824ece151)) Add "thumbnailUrlLastFetched" to thumbnail url ([#607](https://github.com/Suwayomi/Suwayomi-WebUI/pull/607) by @schroda)
- ([r1399](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e5ffbb462c191a9f94e57bd837371d9d10374690)) Feature/gql remove download ahead limit ([#608](https://github.com/Suwayomi/Suwayomi-WebUI/pull/608) by @schroda)
- ([r1398](https://github.com/Suwayomi/Suwayomi-WebUI/commit/fd651b61655315395775f6fdbe6aba672651111f)) Feature/add vui as webui flavor ([#609](https://github.com/Suwayomi/Suwayomi-WebUI/pull/609) by @schroda)
- ([r1397](https://github.com/Suwayomi/Suwayomi-WebUI/commit/05077b4a2be05f10f7593b769bba77cc8eaf9ae1)) Correctly link to custom repos settings ([#603](https://github.com/Suwayomi/Suwayomi-WebUI/pull/603) by @schroda)
- ([r1396](https://github.com/Suwayomi/Suwayomi-WebUI/commit/99c9d9d12f3c4a70066f4821d49be99815d3d2f9)) Use set reader width on small devices ([#602](https://github.com/Suwayomi/Suwayomi-WebUI/pull/602) by @schroda)
- ([r1395](https://github.com/Suwayomi/Suwayomi-WebUI/commit/aea112e29298ba6a694e9af2375340220a6717b3)) Create correct manga thumbnail url ([#601](https://github.com/Suwayomi/Suwayomi-WebUI/pull/601) by @schroda)
- ([r1394](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4b54b0939576490948620f01996e593a73581985)) Rename "ExtensionSettings" to "BrowseSettings" ([#600](https://github.com/Suwayomi/Suwayomi-WebUI/pull/600) by @schroda)
- ([r1393](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e383cc9ea8d3a3f59c17551833e5438809ff1ed2)) Add info text to download ahead setting ([#599](https://github.com/Suwayomi/Suwayomi-WebUI/pull/599) by @schroda)
- ([r1392](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c099e01fb70b95412661a98e7669aceda8b2aa87)) Add manga fetch timestamp to thumbnail url ([#598](https://github.com/Suwayomi/Suwayomi-WebUI/pull/598) by @schroda)
- ([r1391](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2acf2b6d33742b9b09becce3912347f0d9f3f1f3)) Feature/download ahead trigger chapter downloads client side ([#597](https://github.com/Suwayomi/Suwayomi-WebUI/pull/597) by @schroda)
- ([r1390](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0edec685f9d96eb0cdf94d6e176b730fc743fb65)) Correctly select next chapter id for download ahead ([#596](https://github.com/Suwayomi/Suwayomi-WebUI/pull/596) by @schroda)
- ([r1389](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d244ba65381e68206229dcacc1e20b7c9409ae5a)) Fit double page reader pages correctly to windows width ([#595](https://github.com/Suwayomi/Suwayomi-WebUI/pull/595) by @schroda)
- ([r1388](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4ffd3584c6f2c70cda9fd6e2a1630ed91e1d0c74)) Handle RTL reading direction for double page reader ([#594](https://github.com/Suwayomi/Suwayomi-WebUI/pull/594) by @schroda)
- ([r1387](https://github.com/Suwayomi/Suwayomi-WebUI/commit/444ebf80071c083588c79e31f18d98eb740b2564)) Fix/reader outdated chapter page count ([#593](https://github.com/Suwayomi/Suwayomi-WebUI/pull/593) by @schroda)
- ([r1386](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5017ba99328d3f200a92f2ffcfcdd50d2ec2bdaa)) Handle backup creation on same domain as server ([#592](https://github.com/Suwayomi/Suwayomi-WebUI/pull/592) by @schroda)
- ([r1385](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7caea4e5262ecbd42a06a37de57623a2cafa9b61)) Download ahead only in case current and next chapter are downloaded (by @schroda)
- ([r1384](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d5b633f5c97b4ba596703dc50a3150745ad621da)) Feature/improve create changelog script ([#591](https://github.com/Suwayomi/Suwayomi-WebUI/pull/591) by @schroda)
- ([r1383](https://github.com/Suwayomi/Suwayomi-WebUI/commit/bf3815e3bd35aaf33d4e7039d7e9021419d062eb)) Correctly update cache after updating an extension ([#590](https://github.com/Suwayomi/Suwayomi-WebUI/pull/590) by @schroda)
- ([r1382](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7fb1dae9c4571586f5fc00a915a1119b4e670a47)) decrease reader's up and down arrows scrolling distance ([#588](https://github.com/Suwayomi/Suwayomi-WebUI/pull/588) by @JiPaix, @schroda)
- ([r1381](https://github.com/Suwayomi/Suwayomi-WebUI/commit/3077824ca70ffe8e1949d559dd376f5c89a6782c)) Update dependencies ([#587](https://github.com/Suwayomi/Suwayomi-WebUI/pull/587) by @schroda)
- ([r1380](https://github.com/Suwayomi/Suwayomi-WebUI/commit/76e5c674174c9f055a768cdfa9570f3e001b3cfc)) Translations update from Hosted Weblate ([#548](https://github.com/Suwayomi/Suwayomi-WebUI/pull/548) by @weblate, @jesusFx, @Yuhyeong, @a18ccms, @plum7x, @HiyoriTUK)
- ([r1379](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b074de26a23758b8900591f31200c8359fe6b5da)) Fix/install external extension does not update extension list ([#580](https://github.com/Suwayomi/Suwayomi-WebUI/pull/580) by @schroda)
- ([r1378](https://github.com/Suwayomi/Suwayomi-WebUI/commit/506e0aa0e38c0bcb26931b85ef1d6d688b2d95ca)) Update extension list after removing an obsolete extension ([#579](https://github.com/Suwayomi/Suwayomi-WebUI/pull/579) by @schroda)
- ([r1377](https://github.com/Suwayomi/Suwayomi-WebUI/commit/cee566d9b294d6499e938488fadb497c5dbc2b3f)) [Codegen] Update manga chapter total count on initial refresh ([#582](https://github.com/Suwayomi/Suwayomi-WebUI/pull/582) by @schroda)
- ([r1376](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c483e71bf1275c298979111ac244c2ff99794c20)) Remove automatic manga update ([#583](https://github.com/Suwayomi/Suwayomi-WebUI/pull/583) by @schroda)
- ([r1375](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d6468bca57e9cdfd69531fb1e994a4bbc16a42bc)) Add manga migrate option to menu on mobile devices ([#584](https://github.com/Suwayomi/Suwayomi-WebUI/pull/584) by @schroda)
- ([r1374](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6716339c0e754bd5aa3fc5bea4484354c6fb4697)) Set default value for resetting to 50% ([#585](https://github.com/Suwayomi/Suwayomi-WebUI/pull/585) by @schroda)
- ([r1373](https://github.com/Suwayomi/Suwayomi-WebUI/commit/891d6f4165a18656e5fc6e040ead218f8675dde0)) Fix/manga migration opening search twice ([#586](https://github.com/Suwayomi/Suwayomi-WebUI/pull/586) by @schroda)
- ([r1372](https://github.com/Suwayomi/Suwayomi-WebUI/commit/10ec7de628978eec481a829a119da80a8af6e86e)) Correctly calculate width ([#578](https://github.com/Suwayomi/Suwayomi-WebUI/pull/578) by @schroda)
- ([r1371](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f335b59dca5af5f82a62ab8db0b88734a0e53097)) Actually send library db cleanup mutation ([#577](https://github.com/Suwayomi/Suwayomi-WebUI/pull/577) by @schroda)
- ([r1370](https://github.com/Suwayomi/Suwayomi-WebUI/commit/18ca66cb4046128cd24fd0c916d2c27a4ec62fdf)) Feature/settings add flaresolverr ([#568](https://github.com/Suwayomi/Suwayomi-WebUI/pull/568) by @schroda)
- ([r1369](https://github.com/Suwayomi/Suwayomi-WebUI/commit/771d6beb18dbecc3a3723eace34fe1f121385396)) Add missing gap to VerticalReader mode with fit to window setting ([#574](https://github.com/Suwayomi/Suwayomi-WebUI/pull/574) by @schroda)
- ([r1368](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ab4cddfedde67aa3c287b10e8a81c300ffcc808f)) Force a reconnect in case a heartbeat is missing ([#569](https://github.com/Suwayomi/Suwayomi-WebUI/pull/569) by @schroda)
- ([r1367](https://github.com/Suwayomi/Suwayomi-WebUI/commit/15825fbe530bf1de58565db63545341b84225da9)) Prevent pages from being bigger than the 100% in width ([#573](https://github.com/Suwayomi/Suwayomi-WebUI/pull/573) by @schroda)
- ([r1366](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2dab88eb7ef26eba29c96c9bbf6ef13fce95eea6)) Decrease default "reader width" to 50% ([#576](https://github.com/Suwayomi/Suwayomi-WebUI/pull/576) by @schroda)
- ([r1365](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4d75474b39b1fda4c3e33e1fd58fce6df1e8db30)) Fix reader width ([#567](https://github.com/Suwayomi/Suwayomi-WebUI/pull/567) by @chancez, @schroda)
- ([r1364](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e0c5e0521dbb56e3cfa2d7b3738908acf250feab)) Feature/manga migration ([#536](https://github.com/Suwayomi/Suwayomi-WebUI/pull/536) by @schroda)
- ([r1363](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5224ad139168220bf141dc3e9e513dd73f27722f)) Add missing id to request ([#571](https://github.com/Suwayomi/Suwayomi-WebUI/pull/571) by @schroda)
- ([r1362](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6edf3bad64b55c61bbd0f5d0f8baf6e18cd688a1)) [ESLint] Allow zero warnings ([#575](https://github.com/Suwayomi/Suwayomi-WebUI/pull/575) by @schroda)
- ([r1361](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5032a0ae94d32fdf9e6d4239df9e5e448a1719cf)) Make reader width configurable ([#565](https://github.com/Suwayomi/Suwayomi-WebUI/pull/565) by @chancez)
- ([r1360](https://github.com/Suwayomi/Suwayomi-WebUI/commit/dcbf5a1899c415905be93b428faf93a4a87f7d0b)) Fix/library manga selection type error ([#566](https://github.com/Suwayomi/Suwayomi-WebUI/pull/566) by @schroda)
- ([r1359](https://github.com/Suwayomi/Suwayomi-WebUI/commit/69a62b6c2cfd32033e9b546d2005af9cd4c961ca)) Add webUI settings again ([#564](https://github.com/Suwayomi/Suwayomi-WebUI/pull/564) by @schroda)
- ([r1358](https://github.com/Suwayomi/Suwayomi-WebUI/commit/24379c1e46ce87aaa007b35529c80396d4d04af2)) Infinitely try to reconnect gql subscriptions ([#563](https://github.com/Suwayomi/Suwayomi-WebUI/pull/563) by @schroda)
- ([r1357](https://github.com/Suwayomi/Suwayomi-WebUI/commit/05f57730db4901d3b20b1e33f6b41afcc13baebf)) Support configuring automatic downloads by category ([#562](https://github.com/Suwayomi/Suwayomi-WebUI/pull/562) by @chancez)
- ([r1356](https://github.com/Suwayomi/Suwayomi-WebUI/commit/de596426bf705118a5f1d8d4da7d3d0942251d67)) [Codegen] Update generated files ([#561](https://github.com/Suwayomi/Suwayomi-WebUI/pull/561) by @schroda)
- ([r1355](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f8e1bfc401ac4869e8d5e790d526cfa059680a42)) Correctly change the category of a manga from the library ([#560](https://github.com/Suwayomi/Suwayomi-WebUI/pull/560) by @schroda)
- ([r1354](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1c2a196950553b365cacfdb7cb2974aac41558fe)) Fix/adding manga to library not updating category ([#559](https://github.com/Suwayomi/Suwayomi-WebUI/pull/559) by @schroda)
- ([r1353](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e10cbf9e8f0f133ce84a9b647a919afac361df38)) Add extension settings screen ([#557](https://github.com/Suwayomi/Suwayomi-WebUI/pull/557) by @schroda)
- ([r1352](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f0e1bd32493e6ea68bcd759a817f3200acc1dd2b)) Feature/extension list show info when no repo is defined ([#556](https://github.com/Suwayomi/Suwayomi-WebUI/pull/556) by @schroda)
- ([r1351](https://github.com/Suwayomi/Suwayomi-WebUI/commit/42e3d64f80fc5de93a464c758ecbb46d75bf9e61)) Clear extensions cache after extension repos change ([#555](https://github.com/Suwayomi/Suwayomi-WebUI/pull/555) by @schroda)
- ([r1350](https://github.com/Suwayomi/Suwayomi-WebUI/commit/bed586383f5b9f5720a91a8ac0ab5de987b8be8a)) Update extension repo regex to server changes ([#554](https://github.com/Suwayomi/Suwayomi-WebUI/pull/554) by @schroda)
- ([r1349](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6708a958cebcc7d94ae3f860d4ad00580db3e9f0)) Render selection fab in case only one category exists ([#553](https://github.com/Suwayomi/Suwayomi-WebUI/pull/553) by @schroda)
- ([r1348](https://github.com/Suwayomi/Suwayomi-WebUI/commit/38b364bb550473697b2c6a7729a5942c44047f53)) Remove reader webtoon mode page gaps ([#552](https://github.com/Suwayomi/Suwayomi-WebUI/pull/552) by @schroda)
- ([r1347](https://github.com/Suwayomi/Suwayomi-WebUI/commit/738a22233bc1cf7fd3bdeb542ac57b73814f3674)) Internationalize failed img retry text ([#551](https://github.com/Suwayomi/Suwayomi-WebUI/pull/551) by @schroda)
- ([r1346](https://github.com/Suwayomi/Suwayomi-WebUI/commit/199b62341fb8c54ca17924b77ae56e21d61c2c33)) Feature/add retry button for failed image requests ([#550](https://github.com/Suwayomi/Suwayomi-WebUI/pull/550) by @schroda)
- ([r1345](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9962e0713d4753782dad65b56c34c3ea4a81977c)) Adding page loading with Double Page Mode. ([#480](https://github.com/Suwayomi/Suwayomi-WebUI/pull/480) by @rickymcmuffin, @schroda)
- ([r1344](https://github.com/Suwayomi/Suwayomi-WebUI/commit/be5497af94a18336b52c892dbc714ecb24461969)) Add new library sort options ([#547](https://github.com/Suwayomi/Suwayomi-WebUI/pull/547) by @schroda)
- ([r1343](https://github.com/Suwayomi/Suwayomi-WebUI/commit/3973eda0897e2a1f080d2280b606d069faa3b27d)) [ServerMapping][Codegen] Update to latest server gql MangaType changes ([#546](https://github.com/Suwayomi/Suwayomi-WebUI/pull/546) by @schroda)
- ([r1342](https://github.com/Suwayomi/Suwayomi-WebUI/commit/955cc682fd7186587acd90b00fb929da0e1cdbba)) Apply filters when searching in SourceMangas ([#545](https://github.com/Suwayomi/Suwayomi-WebUI/pull/545) by @schroda)
- ([r1341](https://github.com/Suwayomi/Suwayomi-WebUI/commit/89e8472ebc6edc50ea9af74429f378394687abda)) Add disclaimer to custom repositories setting ([#544](https://github.com/Suwayomi/Suwayomi-WebUI/pull/544) by @schroda)
- ([r1340](https://github.com/Suwayomi/Suwayomi-WebUI/commit/fd1fa63064bd91b61de54947e68f50ae5aa8a59a)) Feature/show extension repo only in case more than one repo is set ([#543](https://github.com/Suwayomi/Suwayomi-WebUI/pull/543) by @schroda)
- ([r1339](https://github.com/Suwayomi/Suwayomi-WebUI/commit/684ae69470af71b74c746bd59264ca6f99cdd568)) Update tokens ([#542](https://github.com/Suwayomi/Suwayomi-WebUI/pull/542) by @schroda)
- ([r1338](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1b3cc6bfe3857ba808f93089839c7e15851633e7)) Translations update from Hosted Weblate ([#541](https://github.com/Suwayomi/Suwayomi-WebUI/pull/541) by @weblate, @zmmx)
- ([r1337](https://github.com/Suwayomi/Suwayomi-WebUI/commit/8faa756ab51ac6200424727998defba001803e40)) Feature/improve custom extension repos support ([#540](https://github.com/Suwayomi/Suwayomi-WebUI/pull/540) by @schroda)
- ([r1336](https://github.com/Suwayomi/Suwayomi-WebUI/commit/39b79c6ebef0f71f64c51f69e9e1c1f22c09f1a7)) Feature/settings support custom extension repos ([#539](https://github.com/Suwayomi/Suwayomi-WebUI/pull/539) by @schroda)
- ([r1335](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b42c3103f1c62f2eb4151ded7f3025b25ff26c4c)) Feature/rebrand to suwayomi ([#500](https://github.com/Suwayomi/Suwayomi-WebUI/pull/500) by @schroda)
- ([r1334](https://github.com/Suwayomi/Suwayomi-WebUI/commit/779dafe1dc04f1b6e9ee37e656f90e82542e58fd)) Pass correct group sizes to "GroupedVirtuoso" ([#537](https://github.com/Suwayomi/Suwayomi-WebUI/pull/537) by @schroda)
- ([r1333](https://github.com/Suwayomi/Suwayomi-WebUI/commit/db65b9df44521cb78e76c64328a308e071b65aac)) Feature/merge source and extensions screen on desktop ([#535](https://github.com/Suwayomi/Suwayomi-WebUI/pull/535) by @schroda)
- ([r1332](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9caca6e753a8217e9928f0d4ca6d4fe5f893295a)) Update dependencies ([#534](https://github.com/Suwayomi/Suwayomi-WebUI/pull/534) by @schroda)
- ([r1331](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6c46c562522b443d5194496203752dc67e40348f)) Handle showing disabled state of automatic chapter deletion ([#533](https://github.com/Suwayomi/Suwayomi-WebUI/pull/533) by @schroda)
- ([r1330](https://github.com/Suwayomi/Suwayomi-WebUI/commit/05fa3d0732d660b92ad125fd9bead7cab8a312d7)) Fix/chapter not getting deleted after being read ([#532](https://github.com/Suwayomi/Suwayomi-WebUI/pull/532) by @schroda)
- ([r1329](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7d3d82556a33109d7d823175189b6b5f43ad4b87)) Handle extension update failure ([#530](https://github.com/Suwayomi/Suwayomi-WebUI/pull/530) by @schroda)
- ([r1328](https://github.com/Suwayomi/Suwayomi-WebUI/commit/37ce494fda66f0898f4fb7738e928b1f45bf0fd4)) Log promise failures instead of ignoring them ([#531](https://github.com/Suwayomi/Suwayomi-WebUI/pull/531) by @schroda)
- ([r1327](https://github.com/Suwayomi/Suwayomi-WebUI/commit/37d6b84cf41ceae1a6679c3fdfdc89e53cd348dc)) Use correct titles for manga actions in selection mode ([#529](https://github.com/Suwayomi/Suwayomi-WebUI/pull/529) by @schroda)
- ([r1326](https://github.com/Suwayomi/Suwayomi-WebUI/commit/edc2a62a7605209118eaaa778f0ef5fa21b29eb9)) Feature/cleanup files ([#528](https://github.com/Suwayomi/Suwayomi-WebUI/pull/528) by @schroda)
- ([r1325](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ecea80f41e8962fb5636cfbe9d1d878dd9f24b63)) Merge manga action menus ([#527](https://github.com/Suwayomi/Suwayomi-WebUI/pull/527) by @schroda)
- ([r1324](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a3a52064ccaac827ada5c64865de6acc95e6016e)) Feature/cleanup chapter actions ([#525](https://github.com/Suwayomi/Suwayomi-WebUI/pull/525) by @schroda)
- ([r1323](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d15be603b1afde980acd4d53ed3a03a3178f3e8e)) Use up-to-date manga data for selection fab actions ([#526](https://github.com/Suwayomi/Suwayomi-WebUI/pull/526) by @schroda)
- ([r1322](https://github.com/Suwayomi/Suwayomi-WebUI/commit/356303ab5adf0f33f3dcfa5c24fb821268b82842)) Allow browser context menu for images in reader ([#524](https://github.com/Suwayomi/Suwayomi-WebUI/pull/524) by @schroda)
- ([r1321](https://github.com/Suwayomi/Suwayomi-WebUI/commit/120e97e882a9a12552363b5ba97965c9c2700669)) Feature/restore backup inform about missing sources ([#523](https://github.com/Suwayomi/Suwayomi-WebUI/pull/523) by @schroda)
- ([r1320](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a1dca02feac1d0952e8bd4923c1539c9e9d268c9)) Add missing extension key field to mutation result ([#522](https://github.com/Suwayomi/Suwayomi-WebUI/pull/522) by @schroda)
- ([r1319](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f81b20b4fdec6956466e1adf60a999def4a2b174)) Fix/library continue read button causes page refresh ([#521](https://github.com/Suwayomi/Suwayomi-WebUI/pull/521) by @schroda)
- ([r1318](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f12f025e9d8850dd978cd9f8f482928581a63765)) Add option to remove non library mangas from categories ([#520](https://github.com/Suwayomi/Suwayomi-WebUI/pull/520) by @schroda)
- ([r1317](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e025efb9dc8a04d208b7549c121259d93832be92)) Feature/add manga to library category select dialog ([#519](https://github.com/Suwayomi/Suwayomi-WebUI/pull/519) by @schroda)
- ([r1316](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1345cfe62498d0e859f62fc09679295080250578)) Update manga category selection in case categories changed ([#518](https://github.com/Suwayomi/Suwayomi-WebUI/pull/518) by @schroda)
- ([r1315](https://github.com/Suwayomi/Suwayomi-WebUI/commit/446deeae06b4c8f5f189685969105b185043f0a7)) Feature/library manga actions ([#506](https://github.com/Suwayomi/Suwayomi-WebUI/pull/506) by @schroda)
- ([r1314](https://github.com/Suwayomi/Suwayomi-WebUI/commit/980da657d99dd8d01fed82b5c80be7e3b01d0429)) [Codegen] Check cache before executing query for a single item ([#513](https://github.com/Suwayomi/Suwayomi-WebUI/pull/513) by @schroda)
- ([r1313](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c115fcd5739ed17c3de26f5146c6d6e2a3381cda)) Feature/make selection logic reusable ([#515](https://github.com/Suwayomi/Suwayomi-WebUI/pull/515) by @schroda)
- ([r1312](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c8747d6db4bac16915b41e742f9f78a43919107c)) Use correct key to normalize extensions ([#512](https://github.com/Suwayomi/Suwayomi-WebUI/pull/512) by @schroda)
- ([r1311](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0615ef87ce03e4d9549c88cdedc052d1b164f762)) Add divider between library tabs and mangas ([#514](https://github.com/Suwayomi/Suwayomi-WebUI/pull/514) by @schroda)
- ([r1310](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2390361fb2b63fbe0726c93c4ac3a4afd04e29d2)) [Codegen] Request manga download count with chapter deletion mutation ([#516](https://github.com/Suwayomi/Suwayomi-WebUI/pull/516) by @schroda)
- ([r1309](https://github.com/Suwayomi/Suwayomi-WebUI/commit/168e8f82f6f44c277f79467f2eb92aa3fc21a31b)) Use "Footer" to prevent fab overlapping the last item ([#517](https://github.com/Suwayomi/Suwayomi-WebUI/pull/517) by @schroda)
- ([r1308](https://github.com/Suwayomi/Suwayomi-WebUI/commit/09d1cf91e002db1667881648d216a690a0d4f516)) Prevent navigation state update in case path already changed ([#511](https://github.com/Suwayomi/Suwayomi-WebUI/pull/511) by @schroda)
- ([r1307](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e4beafb11f1ee9dd4f464e7d627e40d58dad2115)) Cancel the navigation state update correctly ([#507](https://github.com/Suwayomi/Suwayomi-WebUI/pull/507) by @schroda)
- ([r1306](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e966b0328bbee4bd91bd6f9ea13881bdfd31cbb3)) Remove unnecessary query refetches with mutations ([#508](https://github.com/Suwayomi/Suwayomi-WebUI/pull/508) by @schroda)
- ([r1305](https://github.com/Suwayomi/Suwayomi-WebUI/commit/3756b65256840e9bef6c277b73ddce977427800e)) Correctly check for dev env ([#509](https://github.com/Suwayomi/Suwayomi-WebUI/pull/509) by @schroda)
- ([r1304](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f4e84412389af1332bc374856d1b44904d7b6270)) Prevent ApolloError handling the manga category mutation result ([#510](https://github.com/Suwayomi/Suwayomi-WebUI/pull/510) by @schroda)
- ([r1303](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2f8c284c8b09298fb56182e8d7d7438a49180abf)) Add continue read button to library ([#505](https://github.com/Suwayomi/Suwayomi-WebUI/pull/505) by @schroda)
- ([r1302](https://github.com/Suwayomi/Suwayomi-WebUI/commit/663e20fff9d81f381ce7b56a89b3b484a460de5c)) Visualize read chapters in the update list ([#504](https://github.com/Suwayomi/Suwayomi-WebUI/pull/504) by @schroda)
- ([r1301](https://github.com/Suwayomi/Suwayomi-WebUI/commit/953ebbe5a639e737776ae3e4fc29581ce493f616)) Add button to mark all chapters as read ([#503](https://github.com/Suwayomi/Suwayomi-WebUI/pull/503) by @schroda)
- ([r1300](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5010b706fdce5746bf20b47c7bd5e77c88b5b15e)) Add button to download all chapters ([#503](https://github.com/Suwayomi/Suwayomi-WebUI/pull/503) by @schroda)
- ([r1299](https://github.com/Suwayomi/Suwayomi-WebUI/commit/90cec353586f557337f2450f5067ab15a94a2275)) Add button to quickly select all chapters ([#503](https://github.com/Suwayomi/Suwayomi-WebUI/pull/503) by @schroda)
- ([r1298](https://github.com/Suwayomi/Suwayomi-WebUI/commit/226f2e170f0c82dad81eedc22e00a8d166dc8906)) Handle line breaks in the manga description ([#502](https://github.com/Suwayomi/Suwayomi-WebUI/pull/502) by @schroda)
- ([r1297](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1300c10d83c62a05d36320e143f284c4a1263a25)) Remove unnecessary library refetch ([#499](https://github.com/Suwayomi/Suwayomi-WebUI/pull/499) by @schroda)
- ([r1296](https://github.com/Suwayomi/Suwayomi-WebUI/commit/12b6700110abab6205349960fb3a8f6428a3ba6f)) [VersionMapping] Require server version "r1438" for preview ([#498](https://github.com/Suwayomi/Suwayomi-WebUI/pull/498) by @schroda)
- ([r1295](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f542c17fd682681bb5146ee5ef0e8629a83fa820)) Update download subscription to server changes ([#498](https://github.com/Suwayomi/Suwayomi-WebUI/pull/498) by @schroda)
- ([r1294](https://github.com/Suwayomi/Suwayomi-WebUI/commit/62568ce76b82333132ee7ca567dabe86dbcba1f8)) Translations update from Hosted Weblate ([#424](https://github.com/Suwayomi/Suwayomi-WebUI/pull/424) by @weblate, @alexandrejournet, @ibaraki-douji, @nitezs, @misaka10843, @Becods)
- ([r1293](https://github.com/Suwayomi/Suwayomi-WebUI/commit/214043fe9d77726641e7224705aaa7cace428c43)) Fix/script changelog creation ([#496](https://github.com/Suwayomi/Suwayomi-WebUI/pull/496) by @schroda)
- ([r1292](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1dc60af67c1df2b49b864a8ea6c93b6ad48150ba)) Add logic to reorder downloads ([#495](https://github.com/Suwayomi/Suwayomi-WebUI/pull/495) by @schroda)
- ([r1291](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b5f86ae6097d18048c5b4ef8fd5622460a32c31b)) Feature/virtualize download queue ([#494](https://github.com/Suwayomi/Suwayomi-WebUI/pull/494) by @schroda)
- ([r1290](https://github.com/Suwayomi/Suwayomi-WebUI/commit/abee8c7c55c7d0ebc4b39685f4a41912de9a9f71)) Use virtuoso grid state to restore the previous scroll position ([#492](https://github.com/Suwayomi/Suwayomi-WebUI/pull/492) by @schroda)
- ([r1289](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b6b902797e2b9b82d2fd5d45c003dee887dd96a9)) Scroll to top when changing page ([#493](https://github.com/Suwayomi/Suwayomi-WebUI/pull/493) by @schroda)
- ([r1288](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c51897ed54f729470f3661e2f847aad998360368)) Feature/download queue clear queue ([#490](https://github.com/Suwayomi/Suwayomi-WebUI/pull/490) by @schroda)
- ([r1287](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7d574a29f6d01e9ce437c10480baf09104aac19e)) Correctly calculate the remaining time till the next update check ([#491](https://github.com/Suwayomi/Suwayomi-WebUI/pull/491) by @schroda)
- ([r1286](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9cb72243d6e1bdf464cf2f4e2c11d829622f50c6)) Automatically check for server updates ([#489](https://github.com/Suwayomi/Suwayomi-WebUI/pull/489) by @schroda)
- ([r1285](https://github.com/Suwayomi/Suwayomi-WebUI/commit/78310496aa7483f65787b4022662bf662579d653)) Feature/about screen add option to check for and trigger updates ([#485](https://github.com/Suwayomi/Suwayomi-WebUI/pull/485) by @schroda)
- ([r1284](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2caf88ce51d071a8fff0c53d302b0309dff1abff)) Remove incorrect "ListItemSecondaryAction" usage ([#486](https://github.com/Suwayomi/Suwayomi-WebUI/pull/486) by @schroda)
- ([r1283](https://github.com/Suwayomi/Suwayomi-WebUI/commit/fbf627b3aaea47ea88047b6c03804726f2983ec1)) Add option to clear the server cache ([#487](https://github.com/Suwayomi/Suwayomi-WebUI/pull/487) by @schroda)
- ([r1282](https://github.com/Suwayomi/Suwayomi-WebUI/commit/db5d3ff7c0062257f7096df906bdcee84a98c17e)) Remove "directLink" prop ([#488](https://github.com/Suwayomi/Suwayomi-WebUI/pull/488) by @schroda)
- ([r1281](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ad0f0726517197000e2fcd90d81254a384897e0b)) Feature/automatic chapter deletion more options ([#484](https://github.com/Suwayomi/Suwayomi-WebUI/pull/484) by @schroda)
- ([r1280](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ee03c56684aafb60e82b835c9d11f7a9671daaf8)) Fix/mark previous as read action includes the selected chapter ([#483](https://github.com/Suwayomi/Suwayomi-WebUI/pull/483) by @schroda)
- ([r1279](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b2e6c040f154e7ae79bc41cf0e8b3e7d11113ae6)) [i18n] Format text to local lowercase ([#481](https://github.com/Suwayomi/Suwayomi-WebUI/pull/481) by @schroda)
- ([r1278](https://github.com/Suwayomi/Suwayomi-WebUI/commit/259d1d87df38b617a58ae2e0a19df30d4dc85cd7)) Show info about hosted WebUI in "About" ([#482](https://github.com/Suwayomi/Suwayomi-WebUI/pull/482) by @schroda)
- ([r1277](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ee9811bf53d00a8117b760a392d769870f3efb38)) Correctly detect keyboard input "Enter" ([#479](https://github.com/Suwayomi/Suwayomi-WebUI/pull/479) by @schroda)
- ([r1276](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c6cc7c14dd42eaa6b95339f8d798f3fe028b1df1)) Update the "lastRunningState" in case update was triggered outside of app ([#478](https://github.com/Suwayomi/Suwayomi-WebUI/pull/478) by @schroda)
- ([r1275](https://github.com/Suwayomi/Suwayomi-WebUI/commit/47b077cbf5f3d193f0f11b501f8244395c2dbf4e)) Feature/update dependencies ([#477](https://github.com/Suwayomi/Suwayomi-WebUI/pull/477) by @schroda)
- ([r1274](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5aa7fc0f9fcf381739266715f37a1bdb22627a1f)) Remove icon for library search filter setting ([#476](https://github.com/Suwayomi/Suwayomi-WebUI/pull/476) by @schroda)
- ([r1273](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2006ca910954f6b78d0f1cc4ad18a40dd75b7af1)) Feature/handle disabled download ahead limit by default ([#475](https://github.com/Suwayomi/Suwayomi-WebUI/pull/475) by @schroda)
- ([r1272](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6b2245d730eececc6e462b1b771cd676a45e1eaa)) Move the last update timestamp to the body ([#472](https://github.com/Suwayomi/Suwayomi-WebUI/pull/472) by @schroda)
- ([r1271](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7c69a4a5a1b2d49d23a00b17c6624f49222664fb)) Feature/global update last timestamp use stale data while fetching ([#473](https://github.com/Suwayomi/Suwayomi-WebUI/pull/473) by @schroda)
- ([r1270](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a4bd44de9ed4197366cbcf2360293ea41a01523f)) Correctly merge chapter requests ([#474](https://github.com/Suwayomi/Suwayomi-WebUI/pull/474) by @schroda)
- ([r1269](https://github.com/Suwayomi/Suwayomi-WebUI/commit/aa01d6712b4ac4a66b3a134d77f0c1252a50dd16)) Update extensions list after extension update ([#471](https://github.com/Suwayomi/Suwayomi-WebUI/pull/471) by @schroda)
- ([r1268](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7adc28a35c074fb134c2d760f91601c2fc5546a6)) Feature/gql improve queries mutations subscriptions ([#470](https://github.com/Suwayomi/Suwayomi-WebUI/pull/470) by @schroda)
- ([r1267](https://github.com/Suwayomi/Suwayomi-WebUI/commit/3b147b1b46a7b279ee961861fb1874867667602c)) Fix/update gql after server changes ([#469](https://github.com/Suwayomi/Suwayomi-WebUI/pull/469) by @schroda)
- ([r1266](https://github.com/Suwayomi/Suwayomi-WebUI/commit/3766540ce59d19918cfa2f7b8e1454782087d71f)) Add WebUI settings ([#460](https://github.com/Suwayomi/Suwayomi-WebUI/pull/460) by @schroda)
- ([r1265](https://github.com/Suwayomi/Suwayomi-WebUI/commit/cdf922945764eb26d7cdba5007f5fb8d1d44bbbd)) Feature/global update show last update time ([#468](https://github.com/Suwayomi/Suwayomi-WebUI/pull/468) by @schroda)
- ([r1264](https://github.com/Suwayomi/Suwayomi-WebUI/commit/99ba45ecebb3f1c8bc2735cf8499bc73f38432f4)) Use mui tooltip for manga titles ([#467](https://github.com/Suwayomi/Suwayomi-WebUI/pull/467) by @schroda)
- ([r1263](https://github.com/Suwayomi/Suwayomi-WebUI/commit/dbb4bf70af21ea74a4a92e54bdf2dc4a0495f2a9)) Use correct local source header in settings ([#466](https://github.com/Suwayomi/Suwayomi-WebUI/pull/466) by @schroda)
- ([r1262](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d12ac27b617d67c41e7ed5d3ba936ce4fca47761)) Feature/download ahead while reading ([#464](https://github.com/Suwayomi/Suwayomi-WebUI/pull/464) by @schroda)
- ([r1261](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e26907e2cea21ba113333e34c4433568aa0a8ecf)) Prevent TypeError when loading next chapter after last page ([#463](https://github.com/Suwayomi/Suwayomi-WebUI/pull/463) by @schroda)
- ([r1260](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7db5435967a3d41abc976605a501cc688be1d873)) Remove "useCache" query from image requests ([#465](https://github.com/Suwayomi/Suwayomi-WebUI/pull/465) by @schroda)
- ([r1259](https://github.com/Suwayomi/Suwayomi-WebUI/commit/197ee5c94bb4153f8b4db2678a7f38c3a48c4cef)) Persist server settings when disabling them ([#462](https://github.com/Suwayomi/Suwayomi-WebUI/pull/462) by @schroda)
- ([r1258](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1fd9b4e74459a41ed8502700bf717262763670f6)) Disable disallowed settings ([#461](https://github.com/Suwayomi/Suwayomi-WebUI/pull/461) by @schroda)
- ([r1257](https://github.com/Suwayomi/Suwayomi-WebUI/commit/eda682d9abe2bd74c7fcfeaf622880c99e4d5a94)) Remove deprecated cache setting ([#459](https://github.com/Suwayomi/Suwayomi-WebUI/pull/459) by @schroda)
- ([r1256](https://github.com/Suwayomi/Suwayomi-WebUI/commit/cac60fed2c60c2ec90ba7dc2240897993df0a475)) Feature/server settings ([#458](https://github.com/Suwayomi/Suwayomi-WebUI/pull/458) by @schroda)
- ([r1255](https://github.com/Suwayomi/Suwayomi-WebUI/commit/482db4626a7c13af4f769daa82807673a8bc4301)) Prevent infinite re-renders in extensions ([#457](https://github.com/Suwayomi/Suwayomi-WebUI/pull/457) by @schroda)
- ([r1254](https://github.com/Suwayomi/Suwayomi-WebUI/commit/8d4687428fac1f078a1c2acab1abe4c0b13054a5)) Fix/app search ([#456](https://github.com/Suwayomi/Suwayomi-WebUI/pull/456) by @schroda)
- ([r1253](https://github.com/Suwayomi/Suwayomi-WebUI/commit/35c34b6d1b7609acb59cce94a46ce2ca4dab7536)) Feature/search bar improvements ([#455](https://github.com/Suwayomi/Suwayomi-WebUI/pull/455) by @schroda)
- ([r1252](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0c7498dba61da0ff3faec41124f236834d90ba5d)) Prevent pages from getting selected while dragging ([#454](https://github.com/Suwayomi/Suwayomi-WebUI/pull/454) by @schroda)
- ([r1251](https://github.com/Suwayomi/Suwayomi-WebUI/commit/dabe88385d0ff1017eea6e3df9d620cc6550e33f)) Feature/reader vertical pager keyboard bindings scrolling ([#452](https://github.com/Suwayomi/Suwayomi-WebUI/pull/452) by @schroda)
- ([r1250](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9b96560a17b4af243d9990c107c7de765a3a7a48)) Feature/settings backup ([#453](https://github.com/Suwayomi/Suwayomi-WebUI/pull/453) by @schroda)
- ([r1249](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b080286b81760eeb953f893b03e2b2df9cc0d84e)) Reduce chapter updates in the reader (by @schroda)
- ([r1248](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a0a52b11a1260efc4a1532b34291e22f6bef7933)) Fix/pagination of sources which require pages to be fetched in order ([#451](https://github.com/Suwayomi/Suwayomi-WebUI/pull/451) by @schroda)
- ([r1247](https://github.com/Suwayomi/Suwayomi-WebUI/commit/345fbcb5c7322bd55b630489047085872840479b)) Fix/apollo client spamming infinite requets on failure ([#450](https://github.com/Suwayomi/Suwayomi-WebUI/pull/450) by @schroda)
- ([r1246](https://github.com/Suwayomi/Suwayomi-WebUI/commit/291e1899f98a96a8c40ee079521fa425c752c7ec)) Remove re-fetching of manga query on chapter update ([#449](https://github.com/Suwayomi/Suwayomi-WebUI/pull/449) by @schroda)
- ([r1245](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c5f943d571649462167905b8957933f6def01a71)) Get latest manga data from the apollo cache ([#447](https://github.com/Suwayomi/Suwayomi-WebUI/pull/447) by @schroda)
- ([r1244](https://github.com/Suwayomi/Suwayomi-WebUI/commit/593acc7f89e5a2125a13b884d93358bcef141ee0)) Refresh extension list after updating ([#446](https://github.com/Suwayomi/Suwayomi-WebUI/pull/446) by @schroda)
- ([r1243](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9284e46c45a8a97237c09cb887266eabd4e050dd)) Prevent SelectionFAB from being behind the "ChapterCard" checkbox ([#445](https://github.com/Suwayomi/Suwayomi-WebUI/pull/445) by @schroda)
- ([r1242](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4ab61723e7e3e6ebdc30970572ed81149002b8b9)) Add missing tooltips ([#444](https://github.com/Suwayomi/Suwayomi-WebUI/pull/444) by @schroda)
- ([r1241](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d9d92a75fa2bb3f8d45d34b4ae44da67296cdf7a)) Handle source not supporting browse "latest" ([#443](https://github.com/Suwayomi/Suwayomi-WebUI/pull/443) by @schroda)
- ([r1240](https://github.com/Suwayomi/Suwayomi-WebUI/commit/134e47763faae9e62db4d4e3a8387a74e32e5568)) Feature/update dependencies ([#442](https://github.com/Suwayomi/Suwayomi-WebUI/pull/442) by @schroda)
- ([r1239](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7cb062d4534f568c96bdadbbf9066e6c9923d08d)) Feature/extensions always use fetch mutation to get list ([#440](https://github.com/Suwayomi/Suwayomi-WebUI/pull/440) by @schroda)
- ([r1238](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2c35808ee4490acc8bc2e272e29d54443f0b6fe2)) Fetch chapter pages everytime unless chapter is downloaded ([#439](https://github.com/Suwayomi/Suwayomi-WebUI/pull/439) by @schroda)
- ([r1237](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a6cc757d5044603e021a90ca89dfd0fa742c53e0)) Feature/global update settings update manga metadata ([#441](https://github.com/Suwayomi/Suwayomi-WebUI/pull/441) by @schroda)
- ([r1236](https://github.com/Suwayomi/Suwayomi-WebUI/commit/14e7af9a4aff324f40b56ac864da6577d0af52f3)) Feature/modify download settings ([#429](https://github.com/Suwayomi/Suwayomi-WebUI/pull/429) by @schroda)
- ([r1235](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1acda66b1661d608a2b1deaaaa1c14ece344282d)) Feature/update backup restore to server changes ([#438](https://github.com/Suwayomi/Suwayomi-WebUI/pull/438) by @schroda)
- ([r1234](https://github.com/Suwayomi/Suwayomi-WebUI/commit/cc59f88a1d87bf2d234a874ad75d1588c845368a)) Correct library error translations ([#437](https://github.com/Suwayomi/Suwayomi-WebUI/pull/437) by @schroda)
- ([r1233](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a638333684641dd755b0ed52371ffe176174edde)) Handle source browse when first page is also the last page ([#436](https://github.com/Suwayomi/Suwayomi-WebUI/pull/436) by @schroda)
- ([r1232](https://github.com/Suwayomi/Suwayomi-WebUI/commit/529fcf2d258c5fda99c777575c900336b2d9c357)) Mark first chapter as read for "mark previous as read" ([#435](https://github.com/Suwayomi/Suwayomi-WebUI/pull/435) by @schroda)
- ([r1231](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4c6e9a8aa128f0a338ac48edc5456a018b5618cf)) Do not add mangas to the default category ([#433](https://github.com/Suwayomi/Suwayomi-WebUI/pull/433) by @schroda)
- ([r1230](https://github.com/Suwayomi/Suwayomi-WebUI/commit/678df88068f34a7219b61cf7a4a4746ce4dbf106)) Feature/modify global update settings ([#432](https://github.com/Suwayomi/Suwayomi-WebUI/pull/432) by @schroda)
- ([r1229](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4c6d50740500d2823d7990c0192f9aebefea2575)) Feature/show backup restore progress ([#431](https://github.com/Suwayomi/Suwayomi-WebUI/pull/431) by @schroda)
- ([r1228](https://github.com/Suwayomi/Suwayomi-WebUI/commit/30fd8b0fca65416db9ee4aa439a227d3d675bb16)) Feature/support new tachiyomi backup file extension ([#430](https://github.com/Suwayomi/Suwayomi-WebUI/pull/430) by @schroda)
- ([r1227](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5a5b12a9e10fb7d29622b6333013671efbf53011)) [ESLint] Prefer named exports ([#427](https://github.com/Suwayomi/Suwayomi-WebUI/pull/427) by @schroda)
- ([r1226](https://github.com/Suwayomi/Suwayomi-WebUI/commit/68e7b4b16d8cf44d4d50bb77ddb9764c38b1e78d)) Feature/library global update exclude manga with state ([#281](https://github.com/Suwayomi/Suwayomi-WebUI/pull/281) by @schroda)
- ([r1225](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c8f02b3b8c70592cea6e9588118a304477e7e40c)) [ESLint] Add "no-unused-imports" plugin ([#426](https://github.com/Suwayomi/Suwayomi-WebUI/pull/426) by @schroda)
- ([r1224](https://github.com/Suwayomi/Suwayomi-WebUI/commit/76d1ba835c2e6d976dbcee86aaa584d273115016)) Merge pull request #395 from schroda/feature/use_graphql ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1223](https://github.com/Suwayomi/Suwayomi-WebUI/commit/09c7e804ba2a6f76615ebd3136ab4b490c38e7cc)) Refresh library mangas after update ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1222](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b1aaeb4d5d5ce3f54eb64616563b6a81fcbe84a1)) Show loading text for include/exclude categories setting ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1221](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2ad9ccd9bd4d78a9e5aa7ffc592e748c5f55bfd4)) Use gql for loading default category mangas ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1220](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b6382bb33af231ac37810ea338d44e0f79429d2c)) Load only category mangas that are in the library ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1219](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2297f36efb9aed7cf234cec1ed79d730b0f81102)) Add manga to default categories when adding to library ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1218](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e2fed69c903ac2ec2a1d4fd01261afc20e5d3020)) Optimistically refresh categories on reordering ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1217](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b7e1afd4f445c1c72325f5c93740107a6e4a79ca)) Update refetching queries and evicting cache data ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1216](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5263a1102ccfb07268ebd91037a5b677e832130a)) Rename "doRequestNew" to "doRequest" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1215](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b3a432ed2e459cad395a9bbef7f1963a0c168af3)) Update typings ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1214](https://github.com/Suwayomi/Suwayomi-WebUI/commit/16ebfcb51f50c20fcfc4b336bf9f1f4ce0966897)) Correctly update extensions language selection ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1213](https://github.com/Suwayomi/Suwayomi-WebUI/commit/fbcc1fb91a6c166e6c9e24d9015bc4ad82250ee3)) Add optional options arg to all requests ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1212](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d3e15e9d3b36b94072b43b9374d14d9753ac0e76)) Use gql for "subscriptions" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1211](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b79fbcf71dfe9984ad27ff8ed14df84aaafcf041)) Setup graphql subscriptions ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1210](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6a1c302e451e10c9cb67d5b895de8e6c32b8849f)) Remove SWR ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1209](https://github.com/Suwayomi/Suwayomi-WebUI/commit/09f48c2c1734da28ef849c084a41f171d1057077)) Use gql for "backups" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1208](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e2f34f1f479c067eefa60f9e210734be4040382b)) Use gql for "fetchMore" workaround ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1207](https://github.com/Suwayomi/Suwayomi-WebUI/commit/aad87463f34d8fcbf547d67be5e2d9968156f559)) [Codegen] Use gql for "loading chapters" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1206](https://github.com/Suwayomi/Suwayomi-WebUI/commit/78049282a770f912d4f28515937a3b7d0cd62658)) Use gql for "sources" - preferences ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1205](https://github.com/Suwayomi/Suwayomi-WebUI/commit/dcead5a801cec5e7cba92ee5effb458a2940a6ba)) Preserve selected filters on browser back navigation ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1204](https://github.com/Suwayomi/Suwayomi-WebUI/commit/12dd973179e8599fd34782b7f958c09d9609343d)) Use gql for "mangas" VI - source mangas filter ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1203](https://github.com/Suwayomi/Suwayomi-WebUI/commit/3297c7d96c62de34335264925c1d8d80fe376de1)) Use gql for "mangas" V - update manga categories ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1202](https://github.com/Suwayomi/Suwayomi-WebUI/commit/87aef85683a680969fc0999a431c09fd21707e06)) Use gql for "mangas" IV - source mangas popular/latest ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1201](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0a73496cbabfd5acb0fe08375948b5a368ab3c6a)) Use gql for "mangas" III - global search ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1200](https://github.com/Suwayomi/Suwayomi-WebUI/commit/af9d49e5e99fa52a6534307f46ec5a630619c9d7)) Use gql for "mangas" II - category mangas ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1199](https://github.com/Suwayomi/Suwayomi-WebUI/commit/89dc053f00f20832c09271b8ed3239078e03df16)) Use gql for "mangas" I - get manga ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1198](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a5b4b95bce8861751a74bf3c121e32f9c19bff46)) Use gql for "updater" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1197](https://github.com/Suwayomi/Suwayomi-WebUI/commit/222f8f5c9b2af91373fdfbf688dafa4d34eb96a0)) Use gql for "downloader" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1196](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ca18e750bf83e883714a39e1327d25b6349e5a6f)) Use gql for "categories" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1195](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f0d55c01c861821e20671155acd1966c4e98b671)) Use gql for "updating chapters" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1194](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c75e184c5741799c20a76df185762534a3743d06)) Use gql for "updating mangas" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1193](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e1f338d0132e2970d9e4467b94a133fae2aebf72)) Use gql for "sources" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1192](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4a80e18cd0df8e9fc231af46afc8c2d6ddb1d5f6)) Use gql for "extensions" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1191](https://github.com/Suwayomi/Suwayomi-WebUI/commit/81cfeedbba59037998e938ab031f6055f5cbaca6)) Use gql for "checkForUpdate" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1190](https://github.com/Suwayomi/Suwayomi-WebUI/commit/59468bc5685d872600299f5d2f3997230fe57f2c)) Use gql for "about" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1189](https://github.com/Suwayomi/Suwayomi-WebUI/commit/80cb06dfd5ecba58873ef7d029af67571585e188)) Use gql for "global metadata" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1188](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b9480736c31e742fbef78182419efcf2e203085d)) Log apollo errors ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1187](https://github.com/Suwayomi/Suwayomi-WebUI/commit/181eb6c811d2a149b7680935a6968abd73264c68)) Add graphql logic to RequestManager ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1186](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0ee47c872b781e8f80c385f668bb982fd3244e85)) Introduce "BaseClient" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1185](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a0b686497f7b408ede50354f62541272caf0835b)) Move "RestClient" in sub folder ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1184](https://github.com/Suwayomi/Suwayomi-WebUI/commit/bffc1669e211fb9b7a082fa5661bb40bdc59a53b)) Move "RequestManager" in sub folder ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1183](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1c794c24b5e9cc02d9998945091e9cf1783c84a6)) Setup intellij "GraphQL" plugin ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1182](https://github.com/Suwayomi/Suwayomi-WebUI/commit/87ddf2f8443140882f4e9d9334652ab6571c58ec)) [Codegen] Generate files ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1181](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0087d3a87b13fffd9ad50e8d66fa98f38ade38d9)) [Tool][Codegen] Add script to post format the generated graphql file ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1180](https://github.com/Suwayomi/Suwayomi-WebUI/commit/10a57d3388660d479773bdd2d007e923a986d916)) Change "moduleResolution" to "node" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1179](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1b4497db46f9fa6756dc7c93311cc4e74c54670a)) Setup "graphql-codgen" ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1178](https://github.com/Suwayomi/Suwayomi-WebUI/commit/55c1c51edd03f3e7559b32face8dd3e78301cd92)) Create queries, mutations and subscriptions ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1177](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ae5d2525f18912a91d0bf3fa9dfe0ab68740fe92)) Add "apollo-client" dependencies ([#395](https://github.com/Suwayomi/Suwayomi-WebUI/pull/395) by @schroda)
- ([r1176](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5cf07acc1cc87834f6d091e71432c919f4c28e25)) Update BUILDING.md ([#420](https://github.com/Suwayomi/Suwayomi-WebUI/pull/420) by @skrewde)
- ([r1175](https://github.com/Suwayomi/Suwayomi-WebUI/commit/3155c1d602e1ec715f956fc0af2cd1c3361c0f8a)) Add option to offset first page in double page reader ([#418](https://github.com/Suwayomi/Suwayomi-WebUI/pull/418) by @rickymcmuffin)
- ([r1174](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9daf71d85cbe79726af2b87422ee67360876724f)) Translations update from Hosted Weblate ([#411](https://github.com/Suwayomi/Suwayomi-WebUI/pull/411) by @weblate)
- ([r1173](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4e134768ef028798efd3fc8b9ff7666c2e81daa2)) Feature/update dependencies ([#419](https://github.com/Suwayomi/Suwayomi-WebUI/pull/419) by @schroda)
- ([r1172](https://github.com/Suwayomi/Suwayomi-WebUI/commit/686f9d605f332b3bd1ecbe5a253f58f8c23fa434)) Improvements on double page ([#417](https://github.com/Suwayomi/Suwayomi-WebUI/pull/417) by @rickymcmuffin)
- ([r1171](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6afd12b0bbf2938826a0f796888a42a1c8b35d3e)) Update required server version for preview to r1353 ([#415](https://github.com/Suwayomi/Suwayomi-WebUI/pull/415) by @schroda)
- ([r1170](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a8f25f58bf2bcee878465545d3bd89cff21405cc)) Update dependencies ([#414](https://github.com/Suwayomi/Suwayomi-WebUI/pull/414) by @schroda)
- ([r1169](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c23799f0e0714b54966cf14ead8567ba32429406)) Update "UpdateStatus" type to server changes ([#413](https://github.com/Suwayomi/Suwayomi-WebUI/pull/413) by @schroda)
- ([r1168](https://github.com/Suwayomi/Suwayomi-WebUI/commit/bde16d04112d3666a9f8f29979a99aa33bc08070)) Feature/update dependencies ([#410](https://github.com/Suwayomi/Suwayomi-WebUI/pull/410) by @schroda)
- ([r1167](https://github.com/Suwayomi/Suwayomi-WebUI/commit/38b69297f49b8d315fad4c27458d5d8117644da1)) Add new languages to resources ([#409](https://github.com/Suwayomi/Suwayomi-WebUI/pull/409) by @schroda)
- ([r1166](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5d032d3748d0654bc1f9d05820a2908a954ea712)) Translations update from Hosted Weblate ([#403](https://github.com/Suwayomi/Suwayomi-WebUI/pull/403) by @weblate, @xconkhi9x)
- ([r1165](https://github.com/Suwayomi/Suwayomi-WebUI/commit/dd0ab4cb8604ceff9a52d94c4659743ec6b01d8a)) Show "inLibraryIndicator" in "VerticalGrid" ([#408](https://github.com/Suwayomi/Suwayomi-WebUI/pull/408) by @schroda)
- ([r1164](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2f795b9d38d9594f655788cc9e3041206a9f1072)) Fix/tools scripts tsconfig and linting ([#406](https://github.com/Suwayomi/Suwayomi-WebUI/pull/406) by @schroda)
- ([r1163](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ebf6c99dee61e3500a4acb7770315bd8b24a1719)) Fix contributing readme ([#405](https://github.com/Suwayomi/Suwayomi-WebUI/pull/405) by @schroda)
- ([r1162](https://github.com/Suwayomi/Suwayomi-WebUI/commit/48fe8d23e9d4b5e59e4ef70f8e082e098f0959da)) Fix/vite tsconfig setup ([#404](https://github.com/Suwayomi/Suwayomi-WebUI/pull/404) by @schroda)
- ([r1161](https://github.com/Suwayomi/Suwayomi-WebUI/commit/637118ad7a2562255bad507c4d78dcaa373d133c)) Add new languages to resources ([#402](https://github.com/Suwayomi/Suwayomi-WebUI/pull/402) by @schroda)
- ([r1160](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e061fc348c13e4aa14c54a4726e2093a3881907a)) Translations update from Hosted Weblate ([#396](https://github.com/Suwayomi/Suwayomi-WebUI/pull/396) by @weblate, @cnmorocho, @Wip-Sama, @Becods)
- ([r1159](https://github.com/Suwayomi/Suwayomi-WebUI/commit/31dca431e4bfae922ffa9820dc87f6a55370be7a)) Feature/use vite with swc ([#400](https://github.com/Suwayomi/Suwayomi-WebUI/pull/400) by @schroda)
- ([r1158](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a3d36bdb1719b34bc9fe3f5e6655b421363821f0)) Feature/introduce script to create changelog ([#401](https://github.com/Suwayomi/Suwayomi-WebUI/pull/401) by @schroda)
- ([r1157](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a487e47260317bc5bf69238c114e23d59efd93bb)) Feature/update dependencies ([#399](https://github.com/Suwayomi/Suwayomi-WebUI/pull/399) by @schroda)
- ([r1156](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f42aead32b7815c9bc9d0f01b89435030b60a1fa)) Add ui version to server version mapping file ([#398](https://github.com/Suwayomi/Suwayomi-WebUI/pull/398) by @schroda)
- ([r1155](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e4745ee8123e2fc197768f9a11a2e7d0fda30105)) [ESLint] Fix issues ([#397](https://github.com/Suwayomi/Suwayomi-WebUI/pull/397) by @schroda)
- ([r1154](https://github.com/Suwayomi/Suwayomi-WebUI/commit/04f7831dc49aa44d055fcc5112358f6bef7df821)) Use proper button radius ([#393](https://github.com/Suwayomi/Suwayomi-WebUI/pull/393) by @schroda)
- ([r1153](https://github.com/Suwayomi/Suwayomi-WebUI/commit/83c68513576d60e58f033e08d25771b7feadc227)) Update "react-i18next" to v13.x ([#392](https://github.com/Suwayomi/Suwayomi-WebUI/pull/392) by @schroda)
- ([r1152](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5279339b86f2fc0d1946f0ef53d0842a922117fd)) Feature/update i18next to v23.x ([#391](https://github.com/Suwayomi/Suwayomi-WebUI/pull/391) by @schroda)
- ([r1151](https://github.com/Suwayomi/Suwayomi-WebUI/commit/46ccf20168b9aeb595b0303876fb01e22de90bec)) Update dependencies with non-breaking changes ([#390](https://github.com/Suwayomi/Suwayomi-WebUI/pull/390) by @schroda)
- ([r1150](https://github.com/Suwayomi/Suwayomi-WebUI/commit/09b10cd5abba260741084fad71afdfe976d3e372)) Fix/back button not working without browser history ([#389](https://github.com/Suwayomi/Suwayomi-WebUI/pull/389) by @schroda)
- ([r1149](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1d76e990ae58b27739a3802e42af98c1c6dd4913)) Move "@types/node" to dev-dependencies ([#388](https://github.com/Suwayomi/Suwayomi-WebUI/pull/388) by @schroda)
- ([r1148](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7857645800d6973f52ccfa105957d3900156f14d)) Enable changing include/exclude state of "default" category ([#387](https://github.com/Suwayomi/Suwayomi-WebUI/pull/387) by @schroda)
- ([r1147](https://github.com/Suwayomi/Suwayomi-WebUI/commit/67b4bbbdcf2cc8d133e6f365f6e9cbdb49a8d6cf)) Do not use and mutate global array ([#386](https://github.com/Suwayomi/Suwayomi-WebUI/pull/386) by @schroda)
- ([r1146](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5c0dcf1f6ccd69504d3e8617d6e6eebc976612f9)) Rename function ([#386](https://github.com/Suwayomi/Suwayomi-WebUI/pull/386) by @schroda)
- ([r1145](https://github.com/Suwayomi/Suwayomi-WebUI/commit/084308a8331402e9b1af517ccd263712b74649fb)) Fix typo ([#385](https://github.com/Suwayomi/Suwayomi-WebUI/pull/385) by @schroda)
- ([r1144](https://github.com/Suwayomi/Suwayomi-WebUI/commit/95ca2fabaec4b15255f071ea5b47f984a0d9df28)) Group obsolete extensions ([#385](https://github.com/Suwayomi/Suwayomi-WebUI/pull/385) by @schroda)
- ([r1143](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2bbfb5272fa8eb019f01e5e2300af05ad733b265)) Add new languages to resources ([#384](https://github.com/Suwayomi/Suwayomi-WebUI/pull/384) by @schroda)
- ([r1142](https://github.com/Suwayomi/Suwayomi-WebUI/commit/750d2f246462bb276bdcf6f28822bb2c4dab6771)) Translated using Weblate (Ukrainian) ([#292](https://github.com/Suwayomi/Suwayomi-WebUI/pull/292) by @weblate, @Kefir2105, @RafieHardinur, @SuperMario229, @misaka10843, @schroda, @Becods)
- ([r1141](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5d9bc5474c3f0c7d282bb75ab1dbb2ef38952a09)) Prevent white screen in Updates page ([#383](https://github.com/Suwayomi/Suwayomi-WebUI/pull/383) by @Becods)
- ([r1140](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ed9c51cd37afbb9f84682ff48378f722b847cc15)) Reset scroll position when changing the search term ([#382](https://github.com/Suwayomi/Suwayomi-WebUI/pull/382) by @schroda)
- ([r1139](https://github.com/Suwayomi/Suwayomi-WebUI/commit/322cf8c91588d28c3c7f4a1b52e7144b0e94bd8a)) Move Library "search settings" to LibrarySettings ([#381](https://github.com/Suwayomi/Suwayomi-WebUI/pull/381) by @schroda)
- ([r1138](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f5a8c8d35c113aca2643f3e6e1b54611bb1a8db7)) Update reset scroll position flag after doing the reset ([#380](https://github.com/Suwayomi/Suwayomi-WebUI/pull/380) by @schroda)
- ([r1137](https://github.com/Suwayomi/Suwayomi-WebUI/commit/79b5e696b65b1281496a0ee184171054ad47175f)) Fix/setting buttons unclickable area ([#379](https://github.com/Suwayomi/Suwayomi-WebUI/pull/379) by @schroda)
- ([r1136](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0f029cb625bd69e0806aefcc8ad76c7d84147969)) Fix/library manga grid infinite item size on category switch ([#378](https://github.com/Suwayomi/Suwayomi-WebUI/pull/378) by @schroda)
- ([r1135](https://github.com/Suwayomi/Suwayomi-WebUI/commit/cdacc4b2a96668dd6d954aed367fbf1fcf486680)) Always use available width for grid items ([#375](https://github.com/Suwayomi/Suwayomi-WebUI/pull/375) by @schroda)
- ([r1134](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ad3864161691f21751f5f97e116728d5fa3ebf4b)) Only show scrollbar when necessary ([#377](https://github.com/Suwayomi/Suwayomi-WebUI/pull/377) by @schroda)
- ([r1133](https://github.com/Suwayomi/Suwayomi-WebUI/commit/48d559ec190fc9496c40139187431b7d754dcb4f)) Fix/manga grid infinite item width ([#376](https://github.com/Suwayomi/Suwayomi-WebUI/pull/376) by @schroda)
- ([r1132](https://github.com/Suwayomi/Suwayomi-WebUI/commit/cc423932b05e9375c724ed3aad05affe3db09025)) Properly resolve alias paths in vite ([#374](https://github.com/Suwayomi/Suwayomi-WebUI/pull/374) by @schroda)
- ([r1131](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4dcf6a3ad90dddbecef98f0695ac5a0a3b447df7)) Make library tabs menu position fixed ([#369](https://github.com/Suwayomi/Suwayomi-WebUI/pull/369) by @schroda)
- ([r1130](https://github.com/Suwayomi/Suwayomi-WebUI/commit/19d27fdf2621c7271294486d835124a274bb3d1f)) Feature/virtualize manga grid ([#363](https://github.com/Suwayomi/Suwayomi-WebUI/pull/363) by @schroda)
- ([r1129](https://github.com/Suwayomi/Suwayomi-WebUI/commit/3ad33b0a15d0f5e5c34a83f0db2a1f553d76f5b4)) Reset scroll position when changing searchTerm ([#373](https://github.com/Suwayomi/Suwayomi-WebUI/pull/373) by @schroda)
- ([r1128](https://github.com/Suwayomi/Suwayomi-WebUI/commit/938b5166d9df2f431589d77b08770ad17368390a)) Fix Library tab change animation ([#372](https://github.com/Suwayomi/Suwayomi-WebUI/pull/372) by @schroda)
- ([r1127](https://github.com/Suwayomi/Suwayomi-WebUI/commit/05fa6d8fa952443a013f45c264e33d378efa165d)) Never pass "searchTerm" for "filter" source content type request ([#371](https://github.com/Suwayomi/Suwayomi-WebUI/pull/371) by @schroda)
- ([r1126](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0495a932deda341a6035147a93d2ba1043cc65b8)) Use the "disableCache" flag for the "filters" source content type request ([#370](https://github.com/Suwayomi/Suwayomi-WebUI/pull/370) by @schroda)
- ([r1125](https://github.com/Suwayomi/Suwayomi-WebUI/commit/64eb420ba6d88f85704b3a479b4b309c59dab550)) Use same endpoint for search in SearchAll and SourceMangas ([#368](https://github.com/Suwayomi/Suwayomi-WebUI/pull/368) by @schroda)
- ([r1124](https://github.com/Suwayomi/Suwayomi-WebUI/commit/97c77027f22033ffbcef67a5941c007ea74de381)) Scroll to top when changing source manga content type ([#365](https://github.com/Suwayomi/Suwayomi-WebUI/pull/365) by @schroda)
- ([r1123](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5187d4c8428434c1fc3e5036e1c5e7821856a04d)) Fix "hasNextPage" calculation for Library grid ([#366](https://github.com/Suwayomi/Suwayomi-WebUI/pull/366) by @schroda)
- ([r1122](https://github.com/Suwayomi/Suwayomi-WebUI/commit/cc4bf7bb325f986f39c68fe9fd610dd5051df592)) Fix initial infinite swr request for pages > 1 ([#367](https://github.com/Suwayomi/Suwayomi-WebUI/pull/367) by @schroda)
- ([r1121](https://github.com/Suwayomi/Suwayomi-WebUI/commit/dcd5302a2650b17581dd53df6ab873a2f83cc0c3)) Fix/source mangas white screen when directly open page via url ([#362](https://github.com/Suwayomi/Suwayomi-WebUI/pull/362) by @schroda)
- ([r1120](https://github.com/Suwayomi/Suwayomi-WebUI/commit/26b48f15c5887ac72b585f9fd4dcfe11d1f7b59a)) Fix/library settings global update categories empty dialog after updating ([#361](https://github.com/Suwayomi/Suwayomi-WebUI/pull/361) by @schroda)
- ([r1119](https://github.com/Suwayomi/Suwayomi-WebUI/commit/63c1ac95eb25d7b80e5c7328159d1f896ab42146)) Feature/remove use back to util ([#360](https://github.com/Suwayomi/Suwayomi-WebUI/pull/360) by @schroda)
- ([r1118](https://github.com/Suwayomi/Suwayomi-WebUI/commit/87de016d6f50bf4a819bb539ab06583b66fd48d9)) Prevent chapter revalidation on focus event in the Reader ([#359](https://github.com/Suwayomi/Suwayomi-WebUI/pull/359) by @schroda)
- ([r1117](https://github.com/Suwayomi/Suwayomi-WebUI/commit/bbdbccf235bd54af35b6b0de1de228ef986202ea)) Prevent chapter revalidation on focus event in the Reader (#359) (by @schroda)
- ([r1116](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7f83bb9a0a9413d5b469025d82baf7198e36451f)) Do not use stale chapter data for the reader ([#358](https://github.com/Suwayomi/Suwayomi-WebUI/pull/358) by @schroda)
- ([r1115](https://github.com/Suwayomi/Suwayomi-WebUI/commit/67e554ede6ec3691245ab236bc044466d18f47f6)) Prevent updating "lastPageRead" of chapter to the initial chapters "lastPageRead" ([#357](https://github.com/Suwayomi/Suwayomi-WebUI/pull/357) by @schroda)
- ([r1114](https://github.com/Suwayomi/Suwayomi-WebUI/commit/21174dc04ab392cca5ae00f45f2b75a45f37840f)) Add the option to ignore SWR stale data ([#356](https://github.com/Suwayomi/Suwayomi-WebUI/pull/356) by @schroda)
- ([r1113](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f979d207e87da5dd33ba2a0a4e9e93a190f0f5bb)) Open reader via the correct url when using resume FAB ([#355](https://github.com/Suwayomi/Suwayomi-WebUI/pull/355) by @schroda)
- ([r1112](https://github.com/Suwayomi/Suwayomi-WebUI/commit/cce6ec0113f0d88f02fb748b7c297438f4ce12e5)) Preserve "SourceMangas" location state ([#354](https://github.com/Suwayomi/Suwayomi-WebUI/pull/354) by @schroda)
- ([r1111](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0446a01e85e80cb1ebd3d29d88b20a78dffec748)) Remove unused dependency "web-vitals" ([#353](https://github.com/Suwayomi/Suwayomi-WebUI/pull/353) by @schroda)
- ([r1110](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4b83ccc88902135f1801858c4d189f6ff228a1a7)) Feature/use alias for imports ([#352](https://github.com/Suwayomi/Suwayomi-WebUI/pull/352) by @schroda)
- ([r1109](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1ec6d77598788890beea16245d59b5b65410440e)) Fix/library title size info initial render flickering ([#350](https://github.com/Suwayomi/Suwayomi-WebUI/pull/350) by @schroda)
- ([r1108](https://github.com/Suwayomi/Suwayomi-WebUI/commit/00e403ce09f1514db6064732571cab596e154c43)) Use correct endpoint for deleting downloaded chapter ([#351](https://github.com/Suwayomi/Suwayomi-WebUI/pull/351) by @schroda)
- ([r1107](https://github.com/Suwayomi/Suwayomi-WebUI/commit/bc99728dcd9e7b36c8d3495d80bcbd6b3326f072)) Feature/migrate to vite ([#349](https://github.com/Suwayomi/Suwayomi-WebUI/pull/349) by @schroda)
- ([r1106](https://github.com/Suwayomi/Suwayomi-WebUI/commit/fa614a19d257fd9c993ccedebb7da9f2443f1510)) Update dependency "typescript" to v5.x ([#348](https://github.com/Suwayomi/Suwayomi-WebUI/pull/348) by @schroda)
- ([r1105](https://github.com/Suwayomi/Suwayomi-WebUI/commit/57b1c0f680eb33d3849278beb4e14b7428e58e96)) Update dependency "eslint" to v8.42.0 ([#347](https://github.com/Suwayomi/Suwayomi-WebUI/pull/347) by @schroda)
- ([r1104](https://github.com/Suwayomi/Suwayomi-WebUI/commit/61975b5c4935b6c919f4560a82ba95fdd7d3e1cb)) Feature/update dependency react to v18.x ([#346](https://github.com/Suwayomi/Suwayomi-WebUI/pull/346) by @schroda)
- ([r1103](https://github.com/Suwayomi/Suwayomi-WebUI/commit/62bf6d66dccfe3b26caef0018d6d965488c63657)) Update dependency "react-virtuoso" to v4.x ([#345](https://github.com/Suwayomi/Suwayomi-WebUI/pull/345) by @schroda)
- ([r1102](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f2ac73891ca3c524a568035d0d6d581f88c7c3b1)) Update dependency "file-selector" to v0.6.0 ([#344](https://github.com/Suwayomi/Suwayomi-WebUI/pull/344) by @schroda)
- ([r1101](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c6f7cd7731e5e8b0a3fc7b5916d0f2de760da51b)) Feature/update dependency web vitals to v3.x ([#343](https://github.com/Suwayomi/Suwayomi-WebUI/pull/343) by @schroda)
- ([r1100](https://github.com/Suwayomi/Suwayomi-WebUI/commit/548b746ee42e3f4eff6370d62d909514a5538961)) Update dependency "@fontsource/roboto" to v5.x ([#342](https://github.com/Suwayomi/Suwayomi-WebUI/pull/342) by @schroda)
- ([r1099](https://github.com/Suwayomi/Suwayomi-WebUI/commit/7f4ec7a30c600415fd61acd25f6aea52f68935d9)) Update dependency "@mui/icons-material" to v5.11.16 ([#341](https://github.com/Suwayomi/Suwayomi-WebUI/pull/341) by @schroda)
- ([r1098](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4e8813b526fab197a61e22d9a855514f1f9bd203)) Feature/update dependency react router dom to v6.x ([#340](https://github.com/Suwayomi/Suwayomi-WebUI/pull/340) by @schroda)
- ([r1097](https://github.com/Suwayomi/Suwayomi-WebUI/commit/fd5a1e240a51bf19483546551e6a5509b9ca7d0c)) Remove unused dependency "query-string" ([#339](https://github.com/Suwayomi/Suwayomi-WebUI/pull/339) by @schroda)
- ([r1096](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6b05083d950263897ffbaf72b62de5abf795a2c8)) Feature/update dependency use query params to v2.x ([#338](https://github.com/Suwayomi/Suwayomi-WebUI/pull/338) by @schroda)
- ([r1095](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ce02802888d20d968a6abdfbc18562faa59e0902)) Update dependency "@emotion" to v11.11.0 ([#337](https://github.com/Suwayomi/Suwayomi-WebUI/pull/337) by @schroda)
- ([r1094](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c63b4acdf826c4e8a586e48f2e7c005a1275c2cd)) Update dependency "i18n" to v22.5.0 ([#336](https://github.com/Suwayomi/Suwayomi-WebUI/pull/336) by @schroda)
- ([r1093](https://github.com/Suwayomi/Suwayomi-WebUI/commit/31f2e0f839740dcfae3fc0c475f24b3c98128950)) Update dependency "react-beautiful-dnd" to v13.1.1 ([#335](https://github.com/Suwayomi/Suwayomi-WebUI/pull/335) by @schroda)
- ([r1092](https://github.com/Suwayomi/Suwayomi-WebUI/commit/8655fe1f6dfc7466811db36bcd345842264060a6)) Update dependency "@typescript-eslint" to v5.59.8 ([#334](https://github.com/Suwayomi/Suwayomi-WebUI/pull/334) by @schroda)
- ([r1091](https://github.com/Suwayomi/Suwayomi-WebUI/commit/647260f18c708ff2edd7006e2aecd10658835aff)) Update dependency "prettier" to v2.8.8 ([#333](https://github.com/Suwayomi/Suwayomi-WebUI/pull/333) by @schroda)
- ([r1090](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1ce27ea939db46ad0b53e60901b9aa02ea628011)) Feature/update dependency mui to v5.x ([#332](https://github.com/Suwayomi/Suwayomi-WebUI/pull/332) by @schroda)
- ([r1089](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6911f60eb4fa43b83e48420a4108780072c2d096)) Feature/remove dependency mui system ([#331](https://github.com/Suwayomi/Suwayomi-WebUI/pull/331) by @schroda)
- ([r1088](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2a6950b015f75b070a89132d54adb0e999662101)) Feature/remove dependency mui styles ([#330](https://github.com/Suwayomi/Suwayomi-WebUI/pull/330) by @schroda)
- ([r1087](https://github.com/Suwayomi/Suwayomi-WebUI/commit/3a82fd0abb63b8408435963369a72bb3c7d0815b)) Remove unused dependency "react-lazyload" ([#329](https://github.com/Suwayomi/Suwayomi-WebUI/pull/329) by @schroda)
- ([r1086](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9e8c4254bd4f77feb6e6aea3bb4197fa98c223a0)) Remove unused dependency "p-queue" ([#328](https://github.com/Suwayomi/Suwayomi-WebUI/pull/328) by @schroda)
- ([r1085](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9ae7b2e5922a4fe5a548208e729849df8baa59a3)) Remove console log ([#327](https://github.com/Suwayomi/Suwayomi-WebUI/pull/327) by @schroda)
- ([r1084](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0fb204f1419d4d903c5ac7710e6a4ee3c89b260d)) Feature/request manager remove get client usage ([#325](https://github.com/Suwayomi/Suwayomi-WebUI/pull/325) by @schroda)
- ([r1083](https://github.com/Suwayomi/Suwayomi-WebUI/commit/207a87f3e98875aeef0aad6963c8ccb86ad6a789)) Fix import backup file request ([#326](https://github.com/Suwayomi/Suwayomi-WebUI/pull/326) by @schroda)
- ([r1082](https://github.com/Suwayomi/Suwayomi-WebUI/commit/eaa83927898cf3249d443f42ea4621ef89695cf9)) Fix axios requests ([#324](https://github.com/Suwayomi/Suwayomi-WebUI/pull/324) by @schroda)
- ([r1081](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d60ed0c0558c4d9895ab681143f374959709c42f)) Add fit page to window reader setting ([#323](https://github.com/Suwayomi/Suwayomi-WebUI/pull/323) by @Alexandre-P-J)
- ([r1080](https://github.com/Suwayomi/Suwayomi-WebUI/commit/46a7ff6e3bc28fd4e459920a9640ab04a851ce4d)) Feature/refactor source mangas screen ([#314](https://github.com/Suwayomi/Suwayomi-WebUI/pull/314) by @schroda)
- ([r1079](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1480507c353009d2d7238c97f6eaf09fcfddb3ab)) Fix/source options filters state ([#320](https://github.com/Suwayomi/Suwayomi-WebUI/pull/320) by @schroda)
- ([r1078](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f852255d8260e5f19ac5ba81328371f025c30a7e)) Add additional info about SWR infinite load to response ([#321](https://github.com/Suwayomi/Suwayomi-WebUI/pull/321) by @schroda)
- ([r1077](https://github.com/Suwayomi/Suwayomi-WebUI/commit/606ee9de2d8b99e86264cf95d549ec2244908ebf)) RequestManager make requests abortable - Fix missed usages ([#318](https://github.com/Suwayomi/Suwayomi-WebUI/pull/318) by @schroda)
- ([r1076](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c32cb535920da8ac3653890a76a413e225fc8f29)) Feature/improve refactored global search performance ([#317](https://github.com/Suwayomi/Suwayomi-WebUI/pull/317) by @schroda)
- ([r1075](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0d36d2dcfb41709c3515abbb0f4cf3b6d49115d4)) Feature/request manager make requests abortable ([#316](https://github.com/Suwayomi/Suwayomi-WebUI/pull/316) by @schroda)
- ([r1074](https://github.com/Suwayomi/Suwayomi-WebUI/commit/95ceac335b6749530b2d895f40be715ef278e738)) Update to axios v1.x ([#315](https://github.com/Suwayomi/Suwayomi-WebUI/pull/315) by @schroda)
- ([r1073](https://github.com/Suwayomi/Suwayomi-WebUI/commit/84433ffff826e1faf2a110c4b7c7183a1816179c)) Support SWR infinite requests via POST ([#313](https://github.com/Suwayomi/Suwayomi-WebUI/pull/313) by @schroda)
- ([r1072](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6fd0dd0daddd6f3aa141a35a1d27e796df23f440)) Fix "setSourceFilters" request ([#312](https://github.com/Suwayomi/Suwayomi-WebUI/pull/312) by @schroda)
- ([r1071](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a95937f2536e25ce5b3988477306f31300956b3f)) Fix/global search not showing request error ([#310](https://github.com/Suwayomi/Suwayomi-WebUI/pull/310) by @schroda)
- ([r1070](https://github.com/Suwayomi/Suwayomi-WebUI/commit/474e568a05a1f58846323e94f9d821dc440ed36e)) Refactor SearchAll screen ([#308](https://github.com/Suwayomi/Suwayomi-WebUI/pull/308) by @schroda)
- ([r1069](https://github.com/Suwayomi/Suwayomi-WebUI/commit/836b4ea4d21f4b6976ee2678863b3e683326bcb9)) Set the manga ref for the "list style" ([#311](https://github.com/Suwayomi/Suwayomi-WebUI/pull/311) by @schroda)
- ([r1068](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f908195b0982d12c498b019cb956c91ded07dc2b)) Feature/cleanup search all ([#307](https://github.com/Suwayomi/Suwayomi-WebUI/pull/307) by @schroda)
- ([r1067](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0cd5720f54d06d70e15a57afa1ee1f28d52ae5da)) Fix/request manager infinite swr requests ([#306](https://github.com/Suwayomi/Suwayomi-WebUI/pull/306) by @schroda)
- ([r1066](https://github.com/Suwayomi/Suwayomi-WebUI/commit/feac34ba83028b59798d69f55f4cd03b7fc13d16)) Trigger global search request ([#305](https://github.com/Suwayomi/Suwayomi-WebUI/pull/305) by @schroda)
- ([r1065](https://github.com/Suwayomi/Suwayomi-WebUI/commit/aa801a57ee61fb52a544ed77fdfddfe4c9843ffe)) Feature/updates screen use infinite swr hook ([#303](https://github.com/Suwayomi/Suwayomi-WebUI/pull/303) by @schroda)
- ([r1064](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a457d80c446960df5644513fdf4d3a11974243c7)) Feature/streamline backend requests ([#297](https://github.com/Suwayomi/Suwayomi-WebUI/pull/297) by @schroda)
- ([r1063](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f86c7ea08ae0c6a40e628f0d92f8d7f31537c668)) Prevent showing "empty library" message on first load ([#302](https://github.com/Suwayomi/Suwayomi-WebUI/pull/302) by @schroda)
- ([r1062](https://github.com/Suwayomi/Suwayomi-WebUI/commit/58eb2fead3e8bed2b42843293882b5e9d1563ae3)) Feature/enforce license notice in each file via eslint rule ([#304](https://github.com/Suwayomi/Suwayomi-WebUI/pull/304) by @schroda)
- ([r1061](https://github.com/Suwayomi/Suwayomi-WebUI/commit/13dbb8faf4f3353cc342c91cbebb557d83ebf2ab)) Prevent add category FAB from overlaying last category ([#301](https://github.com/Suwayomi/Suwayomi-WebUI/pull/301) by @schroda)
- ([r1060](https://github.com/Suwayomi/Suwayomi-WebUI/commit/14ac872876922128de3e141d1f3c05b5d11da7ad)) Prevent manga page FAB from changing position when selecting chapters ([#300](https://github.com/Suwayomi/Suwayomi-WebUI/pull/300) by @schroda)
- ([r1059](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0a0d902bd28d5eb6b99ef56c53c6abd69151dc37)) Fix/manga screen prevent fab from overlaying last chapter in list ([#298](https://github.com/Suwayomi/Suwayomi-WebUI/pull/298) by @schroda)
- ([r1058](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5aaf0854fea41c4a18e66f53140946fa3e70694c)) Fix/download queue staying stopped when removing download ([#299](https://github.com/Suwayomi/Suwayomi-WebUI/pull/299) by @schroda)
- ([r1057](https://github.com/Suwayomi/Suwayomi-WebUI/commit/8dae72604f8417e4afddc634acfddb4a0f8a8197)) Update to SWR version 2.x ([#296](https://github.com/Suwayomi/Suwayomi-WebUI/pull/296) by @schroda)
- ([r1056](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4aff22079a136c2dc48a34fdfa7e34b17ddfea9b)) Settings language add description ([#294](https://github.com/Suwayomi/Suwayomi-WebUI/pull/294) by @schroda)
- ([r1055](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c8b0c64a8d53808e104672f2b86538bc5ce46e0b)) Add new languages to resources ([#293](https://github.com/Suwayomi/Suwayomi-WebUI/pull/293) by @schroda)
- ([r1054](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b6c87dd630554325e80e2369f10c1b2e7171d18d)) Translations update from Hosted Weblate ([#276](https://github.com/Suwayomi/Suwayomi-WebUI/pull/276) by @weblate, @AriaMoradi, @NathanBnm, @misaka10843, @FumoVite, @JoHena, @bandysharif, @DevCoz)
- ([r1053](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b4b3dc54a7f09ca95e29aab5a277032afc625f7f)) App strings reworked ([#277](https://github.com/Suwayomi/Suwayomi-WebUI/pull/277) by @comradekingu, @schroda)
- ([r1052](https://github.com/Suwayomi/Suwayomi-WebUI/commit/bd91510227d36d4a15a1feddd681b0105bc37ca6)) Remove eslint rule deactivations ([#290](https://github.com/Suwayomi/Suwayomi-WebUI/pull/290) by @schroda)
- ([r1051](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d92dc83ddaca8a7ac45b781761ea7c0ce0ded123)) Display strings in uppercase ([#291](https://github.com/Suwayomi/Suwayomi-WebUI/pull/291) by @schroda)
- ([r1050](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2e05e7d35c0c25c0a1d134f146ebf8ec645a6ed0)) fix/manga_screen_missing_source_toast ([#288](https://github.com/Suwayomi/Suwayomi-WebUI/pull/288) by @schroda)
- ([r1049](https://github.com/Suwayomi/Suwayomi-WebUI/commit/548b22d21151390fbfb599a977d7d2cbb4a732f6)) fix/library_settings_screen_title_update_on_language_change ([#287](https://github.com/Suwayomi/Suwayomi-WebUI/pull/287) by @schroda)
- ([r1048](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b906509f9f7cc9eec8ce5ed7b474a2aae8a5d718)) Add missing licence text ([#286](https://github.com/Suwayomi/Suwayomi-WebUI/pull/286) by @schroda)
- ([r1047](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f5a961e82fb6ddb7b79b3789eaa9102b7af83dd7)) Fix/manga white screen missing extension ([#285](https://github.com/Suwayomi/Suwayomi-WebUI/pull/285) by @schroda)
- ([r1046](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9a27335760a049e53acb9347d78690e7967ccdc5)) Add option to include and exclude categories from the global update ([#265](https://github.com/Suwayomi/Suwayomi-WebUI/pull/265) by @schroda)
- ([r1045](https://github.com/Suwayomi/Suwayomi-WebUI/commit/79b2305e540fa85346d47b598d05bd12004b3742)) Feature/library show number of mangas in category ([#269](https://github.com/Suwayomi/Suwayomi-WebUI/pull/269) by @schroda)
- ([r1044](https://github.com/Suwayomi/Suwayomi-WebUI/commit/4157611d83bd6143a204f4226c719d5b46280dc5)) Feature/improve typing of metadata related logic ([#268](https://github.com/Suwayomi/Suwayomi-WebUI/pull/268) by @schroda)
- ([r1043](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0a56a2f6d48b13bd414b5e4a5327f41b7a0a11f8)) Extensions cleanup ([#257](https://github.com/Suwayomi/Suwayomi-WebUI/pull/257) by @schroda)
- ([r1042](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c81189a9ed35c1144466aa15fea0fcd14f5f464a)) Fix/chapter mark as unread not resetting last page read ([#282](https://github.com/Suwayomi/Suwayomi-WebUI/pull/282) by @schroda)
- ([r1041](https://github.com/Suwayomi/Suwayomi-WebUI/commit/22b3437dcdbad22bffe49955187dfda2e606e874)) Keep "add category" fab position fixed ([#283](https://github.com/Suwayomi/Suwayomi-WebUI/pull/283) by @schroda)
- ([r1040](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d51150b7848cf7a6596bbba7c015328a578dfd16)) Feature/reader skip duplicate chapters ([#262](https://github.com/Suwayomi/Suwayomi-WebUI/pull/262) by @schroda)
- ([r1039](https://github.com/Suwayomi/Suwayomi-WebUI/commit/b1dc13cd30bfdc374123019a9fc51c07e5824633)) Update browser and nav bar title on language change ([#275](https://github.com/Suwayomi/Suwayomi-WebUI/pull/275) by @schroda)
- ([r1038](https://github.com/Suwayomi/Suwayomi-WebUI/commit/92506ccf78ecdfe11fbc71b95ca99267b6c0b621)) Revert "Translated using Weblate (Portuguese)" (by @AriaMoradi)
- ([r1037](https://github.com/Suwayomi/Suwayomi-WebUI/commit/31d3656697c6719de62b0bc424c6f57bdcadbbd3)) Revert "Translated using Weblate (German)" (by @AriaMoradi)
- ([r1036](https://github.com/Suwayomi/Suwayomi-WebUI/commit/14bdb6d9ac6c6766cb02a9eac8ff4aa75a46752e)) Revert "Translated using Weblate (Arabic)" (by @AriaMoradi)
- ([r1035](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2e14b71d18e10f09bc4f9748b7e809eddeaa93a4)) Revert "Translated using Weblate (Spanish)" (by @AriaMoradi)
- ([r1034](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ff79d9e964a8b7e236d65956926f00404baf3bb1)) Revert "Translated using Weblate (French)" (by @AriaMoradi)
- ([r1033](https://github.com/Suwayomi/Suwayomi-WebUI/commit/2050875d6ffc5f8f74be565bf7812d4a79009069)) Merge pull request #274 from weblate/weblate-suwayomi-tachidesk-webui ([#274](https://github.com/Suwayomi/Suwayomi-WebUI/pull/274) by @AriaMoradi)
- ([r1032](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d04d33c658ef885a5b050ed17ab192bc96948cba)) Translated using Weblate (French) ([#274](https://github.com/Suwayomi/Suwayomi-WebUI/pull/274) by @weblate)
- ([r1031](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f9e5e6cf7a04767705095903b31cc46df0cd8c93)) Translated using Weblate (Spanish) ([#274](https://github.com/Suwayomi/Suwayomi-WebUI/pull/274) by @weblate)
- ([r1030](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c34e55ce80a8e98be047cbeae31df6036d79784f)) Translated using Weblate (Arabic) ([#274](https://github.com/Suwayomi/Suwayomi-WebUI/pull/274) by @weblate)
- ([r1029](https://github.com/Suwayomi/Suwayomi-WebUI/commit/fe5edb1c4b2a1af27a185021ff2d7f09abcd144f)) Translated using Weblate (German) ([#274](https://github.com/Suwayomi/Suwayomi-WebUI/pull/274) by @weblate)
- ([r1028](https://github.com/Suwayomi/Suwayomi-WebUI/commit/14d23c3d29050a843a8a2304bd4030c37d269d69)) Translated using Weblate (Portuguese) ([#274](https://github.com/Suwayomi/Suwayomi-WebUI/pull/274) by @weblate)
- ([r1027](https://github.com/Suwayomi/Suwayomi-WebUI/commit/43f367a5460a819b685c7429675d4d5eecd748a5)) Merge remote-tracking branch 'origin/master' ([#274](https://github.com/Suwayomi/Suwayomi-WebUI/pull/274) by @weblate)
- ([r1026](https://github.com/Suwayomi/Suwayomi-WebUI/commit/07c0e83f8fbf7a01f46dc19a9858ee78e867fa49)) fix translation files ([#273](https://github.com/Suwayomi/Suwayomi-WebUI/pull/273) by @AriaMoradi)
- ([r1025](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6f75837b81e078577c49ad67f31cb5501aa8b9ef)) Translations update from Hosted Weblate ([#272](https://github.com/Suwayomi/Suwayomi-WebUI/pull/272) by @weblate, @AriaMoradi)
- ([r1024](https://github.com/Suwayomi/Suwayomi-WebUI/commit/8497a0b12e4ce0d5c7f3d435f4ce3654fcd38a41)) add trnalation policy (by @AriaMoradi)
- ([r1023](https://github.com/Suwayomi/Suwayomi-WebUI/commit/aedbccf83e3f6e9e00fe0070b0ff964d483a3132)) Translated using Weblate (German) ([#272](https://github.com/Suwayomi/Suwayomi-WebUI/pull/272) by @AriaMoradi)
- ([r1022](https://github.com/Suwayomi/Suwayomi-WebUI/commit/8fcbe29031bd4bd57ca965b4b3ce5723038623f3)) Added translation using Weblate (German) ([#272](https://github.com/Suwayomi/Suwayomi-WebUI/pull/272) by @AriaMoradi)
- ([r1021](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ffe0d5160df0293454ef98c683165c07ba7875e2)) Translations update from Hosted Weblate ([#270](https://github.com/Suwayomi/Suwayomi-WebUI/pull/270) by @weblate, @comradekingu, @AriaMoradi, @Zereef)
- ([r1020](https://github.com/Suwayomi/Suwayomi-WebUI/commit/fdb44bb46bca1b5f9c4462754716ef61e05f5c66)) Added translation using Weblate (Portuguese) (by @Zereef)
- ([r1019](https://github.com/Suwayomi/Suwayomi-WebUI/commit/42b80b439b242ac9269bc58d117b348b9e5f009e)) Translated using Weblate (German) (by @J. Lavoie)
- ([r1018](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c11a057a420822206bc5c99398bfd0c4b95ae8a8)) Added translation using Weblate (French) (by @J. Lavoie)
- ([r1017](https://github.com/Suwayomi/Suwayomi-WebUI/commit/f71a29fa93d0155f97157d0407d18597ca2828b4)) Translated using Weblate (Arabic) (by @Shippo)
- ([r1016](https://github.com/Suwayomi/Suwayomi-WebUI/commit/dce6f5259ffba2fd73b52a2d32d8c00f38599334)) Added translation using Weblate (Spanish) (by @PedroJLR)
- ([r1015](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ce06220b9c2c78863196d5c396c76a979856e11f)) Translated using Weblate (German) (by @AriaMoradi)
- ([r1014](https://github.com/Suwayomi/Suwayomi-WebUI/commit/75e021588127f03270acd53ed5754c66222b89a7)) Added translation using Weblate (Arabic) (by @Shippo)
- ([r1013](https://github.com/Suwayomi/Suwayomi-WebUI/commit/70511aa1c8fc6f650293f4cfcb88e6c9785fba68)) Added translation using Weblate (German) (by @AriaMoradi)
- ([r1012](https://github.com/Suwayomi/Suwayomi-WebUI/commit/52b08cfeb11be6e3301cdfc4808722b8cf6234d0)) Deleted translation using Weblate (Norwegian Bokmål) (by @AriaMoradi)
- ([r1011](https://github.com/Suwayomi/Suwayomi-WebUI/commit/226a0cc249e6e0bacb28120d6885738f3bf5a5d1)) Translated using Weblate (Norwegian Bokmål) (by @comradekingu)
- ([r1010](https://github.com/Suwayomi/Suwayomi-WebUI/commit/9fef2bf488ef7466046d384fdf8e6504c603e68a)) Translated using Weblate (French) (by @AriaMoradi)
- ([r1009](https://github.com/Suwayomi/Suwayomi-WebUI/commit/0126cd266b8c55893469c34f14dad102961f8742)) Added translation using Weblate (Norwegian Bokmål) (by @comradekingu)
- ([r1008](https://github.com/Suwayomi/Suwayomi-WebUI/commit/16c0f854fe7fd5911f4f14c4ea9cebe29ba59e9c)) Fix discord and github links ([#267](https://github.com/Suwayomi/Suwayomi-WebUI/pull/267) by @JoHena)
- ([r1007](https://github.com/Suwayomi/Suwayomi-WebUI/commit/39780df0e0504601d0ba1250ddea7ee6155a895b)) add language selection to settings ([#260](https://github.com/Suwayomi/Suwayomi-WebUI/pull/260) by @schroda)
- ([r1006](https://github.com/Suwayomi/Suwayomi-WebUI/commit/d58bd6cd92a74faeaa13a7713efb11e838d73fc2)) add translation keys ([#246](https://github.com/Suwayomi/Suwayomi-WebUI/pull/246) by @schroda)
- ([r1005](https://github.com/Suwayomi/Suwayomi-WebUI/commit/8c129f2e08e8c807b57c7eef802556faa2edcf1b)) Disable "SSR" option in "useMediaQuery" ([#263](https://github.com/Suwayomi/Suwayomi-WebUI/pull/263) by @schroda)
- ([r1004](https://github.com/Suwayomi/Suwayomi-WebUI/commit/8cd1afd2c725e015f8480f51eb0a2965585053d2)) Ignore filters only while searching ([#256](https://github.com/Suwayomi/Suwayomi-WebUI/pull/256) by @schroda)
- ([r1003](https://github.com/Suwayomi/Suwayomi-WebUI/commit/57c8ee2cdc1f6e52a26ed436d0ac438fa390b218)) Add build step to pr workflow ([#259](https://github.com/Suwayomi/Suwayomi-WebUI/pull/259) by @schroda)
- ([r1002](https://github.com/Suwayomi/Suwayomi-WebUI/commit/398626250e71b85029288167ab47f25f297c0914)) Remove console log ([#258](https://github.com/Suwayomi/Suwayomi-WebUI/pull/258) by @schroda)
- ([r1001](https://github.com/Suwayomi/Suwayomi-WebUI/commit/23001a42989f0231e946bd6251b45c6eeda1818e)) update react scripts dependency ([#255](https://github.com/Suwayomi/Suwayomi-WebUI/pull/255) by @schroda)
- ([r1000](https://github.com/Suwayomi/Suwayomi-WebUI/commit/91e7bd2b27beae0c83b8158757600cf396694381)) Added sort by last read ([#254](https://github.com/Suwayomi/Suwayomi-WebUI/pull/254) by @akabhirav)
- ([r999](https://github.com/Suwayomi/Suwayomi-WebUI/commit/e32078917d82991ecdb70f4a9c23e941ff147a23)) Replace Sort by ID with Date Added ([#253](https://github.com/Suwayomi/Suwayomi-WebUI/pull/253) by @akabhirav)
- ([r998](https://github.com/Suwayomi/Suwayomi-WebUI/commit/a67370be62ee4b47c0ad78f338998c82bbf11218)) Introduce override filters while searching setting ([#242](https://github.com/Suwayomi/Suwayomi-WebUI/pull/242) by @akabhirav)
- ([r997](https://github.com/Suwayomi/Suwayomi-WebUI/commit/dcc18bba0083b684190992e252ed1c6e4dc4203d)) extension card cleanup ([#252](https://github.com/Suwayomi/Suwayomi-WebUI/pull/252) by @schroda)
- ([r996](https://github.com/Suwayomi/Suwayomi-WebUI/commit/96254365182cf02425c17649dece4bb7554f9985)) get first unread chapter from original chapter list ([#250](https://github.com/Suwayomi/Suwayomi-WebUI/pull/250) by @schroda)
- ([r995](https://github.com/Suwayomi/Suwayomi-WebUI/commit/c6257acdf11370109a7fca93be5efc536103fa3d)) Show empty library in case search doesn't match anything ([#251](https://github.com/Suwayomi/Suwayomi-WebUI/pull/251) by @schroda)
- ([r994](https://github.com/Suwayomi/Suwayomi-WebUI/commit/96fd1cf73ba0ad18158e9ff99f9dca9944ea1ff4)) remove manually created typing d ts file ([#249](https://github.com/Suwayomi/Suwayomi-WebUI/pull/249) by @schroda)
- ([r993](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1914a61eddc1033eabd2844fd80b8909cf30b6fe)) Add GitHub Action to run tsc on pull request events ([#232](https://github.com/Suwayomi/Suwayomi-WebUI/pull/232) by @schroda)
- ([r992](https://github.com/Suwayomi/Suwayomi-WebUI/commit/56fe90d0499fa674b6833d3ccd99a8b17bd7a0f0)) Translations update from Hosted Weblate ([#241](https://github.com/Suwayomi/Suwayomi-WebUI/pull/241) by @weblate, @comradekingu, @AriaMoradi)
- ([r991](https://github.com/Suwayomi/Suwayomi-WebUI/commit/cd1d24ada7a81f5df43235c310eb90d10eb44103)) Add logic to migrate metadata values ([#227](https://github.com/Suwayomi/Suwayomi-WebUI/pull/227) by @schroda)
- ([r990](https://github.com/Suwayomi/Suwayomi-WebUI/commit/5473d14eaeb8d21aea36f90f2f28833c0cd2817e)) Adds search by genre to WebUI ([#238](https://github.com/Suwayomi/Suwayomi-WebUI/pull/238) by @akabhirav)
- ([r989](https://github.com/Suwayomi/Suwayomi-WebUI/commit/94e45c21333be735cd3e2d76815db4b1962958c2)) add translation keys (by @AriaMoradi)
- ([r988](https://github.com/Suwayomi/Suwayomi-WebUI/commit/688358f67391cadbbb9246f2cf3dc2cfffe9f21d)) add translation keys (by @AriaMoradi)
- ([r987](https://github.com/Suwayomi/Suwayomi-WebUI/commit/76d44bd657a11357d0617f317628ab5dbaf0d0fa)) clean up translations (by @AriaMoradi)
- ([r986](https://github.com/Suwayomi/Suwayomi-WebUI/commit/6f3bc1bc4edac94a4828ca58b2388e51382870b2)) add translation notice (by @AriaMoradi)
- ([r985](https://github.com/Suwayomi/Suwayomi-WebUI/commit/ce839145993ab21d4b42e2245232774205a9d3d2)) add translation files (by @AriaMoradi)
- ([r984](https://github.com/Suwayomi/Suwayomi-WebUI/commit/1c7c3e566c780ae457d376b525ffb8613a903110)) add i18n (#239) (by @AriaMoradi)
- ([r983](https://github.com/Suwayomi/Suwayomi-WebUI/commit/aaedbb7be9e613a22932cbc25a5c40133d34961c)) add pagination to library and fix some prettier issues ([#237](https://github.com/Suwayomi/Suwayomi-WebUI/pull/237) by @akabhirav)
