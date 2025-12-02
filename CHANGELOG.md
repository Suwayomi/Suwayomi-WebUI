# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] (Preview)

### Added
- (**Navigation**) Show extension update information in app navigation
- (**General**) Add support for "ui login" authentication mode
- (**General**) Add support for hosting on subpaths
- (**Backup**) Add option to exclude specific data during backup creation
- (**Backup**) Add option to exclude specific data during backup restore
- (**Library**/**Manga**) Show chapter information on hover over continue reading button
- (**Settings**) Add KOReader sync settings
- (**Settings**) Add database settings
- (**Browse**) Add "open in webview" button in source browse page

### Changed
- (**General**) Improve loading of images
- (**Category**) Prevent creating categories without a name
- (**WebUI Update**) Do not require a forced page refresh when an update has been detected in case the app just got opened
- (**Manga**) Change "duplicate entry detected" dialog "show entry" button to be a link instead of a button

### Fixed
- (**General**) Fix tooltips sometimes causing a layout shift
- (**General**) Fix back button under some specific conditions (e.g., `library category X` → `mange` → `reader` → `manga` → back button → `library`; should have opened `library category X`)
- (**Manga**) Fix failing migration with disabled "tracking" data
- (**Manga**) Fix showing private tracking option for trackers which do not support the option
- (**Manga**) Fix redirection to tracker settings in case no tracker is logged in
- (**Manga**) Fix closing the category select dialog after clicking edit/create button while adding an entry to the library
- (**Manga**) Fix "in library" button after clicking "show duplicate entry" in the "duplicate entry detected" dialog
- (**Library**) Fix showing incorrect info text for an empty category
- (**Browse**) Prevent infinite loading in case the whole source catalogue has been added to the library and the "hide entries in library" setting is enabled
- (**Browse**) Fix using incorrect native language name for some sources (e.g., different chinese languages (zh-hans, zh-hant, ...) were all showing the same native name)
- (**Reader**) Fix mouse drag scrolling inertia effect being locked at 60hz
- (**Reader**) Fix mouse cursor drift during drag scroll
- (**Reader**) Fix deletion of chapters while reading
- (**Reader**) Fix potential page loss (continuous horizontal mode window resize, reader width change, page scale change)
- (**Reader**) Fix current page detection in continuous horizontal mode with right-to-left reading mode
- (**Reader**) Fix occasionally jumping to random pages in continuous reading modes
- (**Extension**) Fix handling obsolete extensions as updatable in case they are marked as having an available update
- (**Theme**) Fix loading of fonts defined in themes
- (**Reader**) Fix broken scrolling in continuous horizontal reading mode

### Translations
Feel free to translate the project on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/)

Thanks to everyone that contributed to the translation of this project.

#### Updated
- Tamil (by தமிழ்நேரம்)
- Polish (by UnknownSkyrimPasserby)
- Korean (by Kim KKAng)
- Japanese (by marimo, 9811pc)
- Spanish (by zeedif)
- Chinese (Traditional) (by plum7x)
- Vietnamese (by Nguyễn Trung Đức)
- Chinese (Simplified) (by 清水汐音)
- German (by Constantin Piber, Christian Heinrich)

#### Removed (less than 75% translated)
- "Italian (it)" (71.6%)

## [20250801.01] (r2717) - 2025-08-01

### Fixed
- (**General**) Fix white screen on page load

### Contributors
Thanks to everyone that contributed to this release

@schroda

## [20250731.01] (r2715) - 2025-07-31

### Added
- (**General**) Add support for the suwayomi WebView
- (**Settings**) Add new OPDS server settings
- (**Settings**) Add new "simple login" authentication setting
- (**Reader**) Add option to change auto scroll direction by using the scroll backward/forward hotkeys while auto scrolling is active
- (**Manga**) Display score and total chapters, if available, in the tracker search results
- (**Manga**) Add support for private track bindings

### Fixed
- (**General**) Fix drag and drop on touch devices
- (**Reader**) Fix auto scrolling with static overlay
- (**Extension**) Fix clicking on action button (install, uninstall, update, ...) opening the extension info page
- (**Manga**) Fix incorrect removal of some text wrapped in "<>" in the description and tracker search result summaries
- (**Settings**) Fix hidden "pure black mode" appearance setting
- (**Chapter**) Fix updating read status of already read chapters when using the mark previous as read option

### Translations
Feel free to translate the project on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/)

Thanks to everyone that contributed to the translation of this project.

#### Updated
- Vietnamese (by Nguyễn Trung Đức)
- Chinese (Simplified) (by 清水汐音)
- Japanese (by 9811pc)
- Polish (by UnknownSkyrimPasserby)
- German (by Constantin Piber)

### Contributors
Thanks to everyone that contributed to this release

@weblate, @cpiber, @EugeneCage, @dejavui, @UnknownSkyrimPasserby, @aizhimoran, @schroda, @9811pc, @AlirezaGh1993, @gianlucalauro, @junmusk, @JiPaix, @leollo98, @LycusCoder, @Sawadikhap, @yutthaphon, @Oxara, @Mamotromico, @plum7x, @jintaxi, @TamilNeram, @shirishsaxena

## [20250703.01] (r2643) - 2025-07-03

### Added
- (**Manga**) Add functionality to click on title/artist/author/genre to trigger library/source/global search
- (**Library**) Add option to perform current search globally
- (**Source**) Add option to disable sources of an extension
- (**Reader**) Add setting to apply chapter list filters
- (**Reader**) Support different languages for auto webtoon detection
- (**Reader**) Make settings dialog transparent while editing some settings
- (**Reader**) Add option to disable infinite chapter scrolling
- (**Reader**) Add option to diable showing transition pages
- (**Reader**) Add custom scroll amount
- (**Source**) Add functionality to pin sources at the top of the source list
- (**Global search**) Add options to show only searches for
  - pinned sources
  - all sources
  - sources with results
- (**Navigation**) Show download queue information in app navigation
- (**Chapter**) Show total missing chapters info on top of the chapter list
- (**Chapter**) Show missing chapters info between chapters in the chapter list

### Changed
- (**Manga**) Require confirmation before removing an entry from your library
- (**Chapter**) Require confirmation for the following actions
  - Download
    - Enqueue: bulk action for 300 or more chapters
    - Delete: single + bulk action
  - Bookmark removal: bulk action
  - Read status change: bulk action
- (**Chapter**) Save chapter list options on the server
- (**Chapter**) Hide chapter list actions while chapters are selected
- (**Chapter**) Clear selection after performing an action
- (**Extension**) Make "All" language a selectable language (was forcibly enabled up until now)
- (**Extension**) Remove language information from uninstalled extension items in list
- (**Source**) Remove language information from not pinned and last used source items in list
- (**Source**) Save "selected languages" on the server
- (**Browse**) Select users preferred languages (from the browser) and the "All" language by default
- (**Browse**) Show selected languages in filter dialog at the start
- (**Browse**) Save show nsfw setting on the server
- (**Browse**) Sort "All" language always at the start in source and extension list (in the filter option it gets sorted naturally)
- (**Browse**) Sort "Other" language always at the bottom in source and extension list (in the filter option it gets sorted naturally)
- (**Browse**) Sort "English" naturally (previously it was always placed at the start)
- (**Theme**) Style scrollbar only on devices that support hovering
- (**Appearance**) Save "app theme", "theme mode", "pure black mode" and "manga grid item width" on the server
- (**Download**) Rename desktop navigation menu item "Download queue" to "Downloads"
- (**Setting**) Prevent setting up basic auth with both an empty username and password. This is an issue on iOS whose native basic auth prompt disables the "login" button in case both fields are empty.

### Removed
- (**Source**) Remove "popular" button on source card

### Fixed
- (**General**) Fix custom long press causing native mobile long press menu to get opened
- (**General**) Fix refreshing data after importing a backup
- (**Reader**) Fix each key press triggering a keybind (example: "n" → next page, "ctrl+n" → next chapter - previously "ctrl+n" would have triggered both keybinds)
- (**Reader**) Fix weird jumpiness while changing pages via progress bar dragging on iOS
- (**Reader**) Fix resuming a chapter when selecting an already visible chapter (infinite scroll) from the chapter list
- (**Reader**) Fix continuous reading mode tap zone click scrolling aborting sometimes
- (**Reader**) Fix continuous reading mode window resize causing unintentional scroll position/current page preservation in some cases
- (**Reader**) Fix scrolling horizontally with trackpads
- (**WebUI Update**) Fix stable changelog url
- (**Global search**) Fix failed source searches getting sorted the same way as if they were successfull
- (**Extension**) Fix link to repository setting in case no extensions are installed
- (**Manga**) Fix data not getting updated properly on a library update (e.g. unread chapter count didn't get updated in case new chapters were found)
- (**Manga**) Add option to click on artist/author to trigger library search
- (**Browse**) Fix browse not loading more pages in some cases after filtering/searching
- (**Chapter**) Fix range selection with active filters
- (**Download**) Fix downloads start/stop button not updating

### Translations
Feel free to translate the project on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/)

Thanks to everyone that contributed to the translation of this project.

#### Added
- Portuguese (Brazil) (by Psico, Jorge Adriano Cavalcante Alves)

#### Updated
- Chinese (Traditional) (by plum7x)
- Vietnamese (by Nguyễn Trung Đức)
- Italian (by xAizawa)
- Polish (by UnknownSkyrimPasserby)
- Chinese (Simplified) (by 清水汐音)
- Spanish (by LordTenebrous)
- Japanese (by 望月桂, adai liu, 9811pc, marimo)
- Tamil (by தமிழ்நேரம்)
- Portuguese (by qaugji, Psico, Zereef)
- French (by JP Brunache)
- German (by Constantin Piber)

### Contributors
Thanks to everyone that contributed to this release

@weblate, @9811pc, @cpiber, @yutthaphon, @dejavui, @UnknownSkyrimPasserby, @dpkass, @marimo-nekomimi, @TamilNeram, @aizhimoran, @schroda, @junmusk, @adriano1816, @Zereef, @plum7x, @FedericoRossiIT, @Well2333, @ketw09, @IDika31, @kosmik7, @letroll, @KrachDev, @MageSneaky, @Tankudoraiba, @tizio04, @xAizawa

## [1.5.1] (r2467) - 2025-04-07

### Fixed
- (**Server update**) Fix detection of available server update

### Translations
Feel free to translate the project on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/)

Thanks to everyone that contributed to the translation of this project.

#### Updated
- Polish (by UnknownSkyrimPasserby)

### Contributors
Thanks to everyone that contributed to this release

@schroda, @weblate, @UnknownSkyrimPasserby

## [1.5.0] (r2461) - 2025-04-05

> ### Required action
> - If you have installed the web app as a PWA you need to reinstall the app after it has been updated to the latest version

### Highlights
- Completely new reader
- Use predefined UI themes or create your own

### Added
- (**General**) Add labels to the navigation side bar icons
- (**General**) Add option to expand and collapse the navigation side bar
- (**General**) Update app styling
- (**General**) Use new suwayomi icon
- (**Settings**) Add log file rotation settings
- (**Themes**) Add different themes (settings > appearance)
- (**Themes**) Add option to create custom themes (settings > appearance)
- (**Themes**) Use dynamic theme colors on manga pages (settings > appearance)
- (**Source**) Sort sources by name
- (**Reader**) Completely new reader
  - New UI
  - Different default settings per reading mode
  - Tap zones ("right and left", kindle, edge, ...)
  - Page scale modes (original, width, height, ...)
  - New resume handling
    - From inside the reader
      - Open previous chapter: last page gets resumed
      - Open next chapter: first page gets resumed
      - Select specific chapter: first page gets resumed
    - From outside the reader
      - Open read chapter: first page gets resumed
      - Open unread chapter: last read page gets resumed
  - Mobile like mouse drag scrolling
  - Auto scrolling
  - Auto webtoon mode
  - Infinite scrolling
  - Transition page between chapters
  - Filter options for images
  - Customizable hotkeys
  - Customizable image pre-loading
    - Only pre-load n images
    - Important: For the double page mode n double pages get pre-loaded (e.g. pre-load 5 "images": up to 10 images will get pre-loaded)
  - Inform about missing chapters on chapter change
  - Inform about changing scanlator on chapter change
- (**History**) Add rudimentary history page
- (**Extensions**) Add option to configure extension source settings from extension page
- (**General**) Include actual error in snackbar
- (**General**) Add close button to snackbar
- (**Chapter**) Add more sort options for the chapter list (by chapter number and upload date)
- (**Settings**) List detected library manga duplicates by title before the ones detected by the description
- (**Settings**) Sort duplicated library manga by title
- (**Settings**) Add "system" mode to get the devices theme (light or dark mode)
- (**Settings**) Improve library duplicated entries detection performance
- (**Library**) Add option to trigger library update for specific category
- (**Library**) Add option to stop the global update by clicking the update button again (hover effect on desktop, on mobile an "X" is showing instead of the percentage)
- (**Library**) Add "has duplicate chapters" filter
- (**Library**) Add status filter (ongoing, finsihed, hiatus, ...)
- (**Library**) Add sort by total chapter count
- (**Library**) Save library options per category
- (**Library**) Add "started" filter
- (**Library**) Improved search
  - Include description, artist, author, source name
  - Do not require each genre to fully match a genre of a manga (e.g. "adv" will match "adventure" instead of having to search for "adventure")
  - Additionally try to compare by removing all non letter and number characters (e.g. "some title" will match "&some-"!title" instead having to search for "&some-"!title")
- (**Reader**) Add mouse wheel scrolling to horizontal mode
- (**Browse**) Remember last browse tab on back navigation
- (**Extensions**) Add option to update all updatable extensions
- (**Extensions**) Sort extensions by name
- (**Downloads**) Add retry button for failed downloads
- (**Migrate**) Add sort options for migratable sources (by source name, manga count; order ascending/descending)

### Changed
- (**General**) Introduce "More" page
  - Remove "Settings" from navigation bar
  - Remove "Downloads" from mobile navigation bar
- (**General**) Rename "Downloads" to "Download queue"
- (**Source**) Consider "Local source" to have language "Other". Up till now its langauge was called "Local source"
- (**Source**) Close the source configuration dialogs when clicking outside of the dialog or pressing "escape"
- (**Manga**) Copy manga title via icon button instead of long pressing title
- (**Manga**) Close the category selection dialog when clicking outside of the dialog or pressing "escape"
- (**Downloads**) Show download progress only in case chapter is currently downloading
- (**Browse**) Close the language selection dialog when clicking outside of the dialog or pressing "escape"
- (**Theme**) Rename "Device theme" to "Theme mode" (white/dark mode)
- (**Settings**) Move link to "Category settings" to "library settings" and "More" page

### Removed
- (**Settings**) Remove "graphql debug level" setting (was removed by the server)

### Fixed
- (**General**) Fix setting browser locale for used date library (some supported browser locales were not correctly detected)
- (**General**) Fix server subscriptions not updating to new server after changing the server address
- (**General**) Fix missing polyfill to support older browsers
- (**General**) Fix missing internationalization of "Local source"
- (**General**) Fix app not using all available space of screen on iOS (PWA needs to be deleted and installed again for the fix to take effect)
- (**General**) Fix mobile bottom bar navigation being behind iOS "home indicator"
- (**General**) Fix large error message from getting pushed outside the screen and being partially unviewable
- (**General**) Fix error "value.toString is not a function" caused by kaspersky
- (**General**) Fix sometimes registering double clicks on touch devices
- (**General**) Fix not respecting right safe area inset on iOS in horizontal rotation
- (**General**) Fix not respecting top safe area inset in the desktop nav bar on iOS
- (**General**) Fix app being uninstallable as a pwa with bathic auth enabled
- (**General**) Fix inferring server port in production to 4567 when webUI is served from 3000 and no specific server address is set in the settings
- (**General**) Fix potentially missing back button on some pages
- (**Settings**) Fix disabled webUI settings for flavors that are not "custom"
- (**Settings**) Fix detected library manga duplicates not being listed for a title in case they were already detected for a different title
- (**Settings**) Fix incorrectly showing an error message and not updating the UI when updating some settings for the first time
- (**Settings**) Fix unresponsive UI while checking for duplicated manga for a large library (settings > library > duplicates)
- (**Settings**) Fix not localized default device name
- (**Settings**) Fix unlimited (min/max value) number inputs in settings
- (**Settings**) Fix not showng error on language change failure
- (**Manga**) Fix continuing to migrate in case an error was thrown which lead to partial migrations
- (**Manga**) Fix manga not getting removed from categories on migraton in case setting is enabled
- (**Manga**) Fix outdated manga chapter information (e.g. unread, bookmark, downloaded count, ...) after updating its chapter list
- (**Manga**) Fix bound trackers not showing up after migration
- (**Manga**) Fix missing error message in case bound tracker information could not be refreshed
- (**Manga**) Fix migration from failing in case the target manga does not have any chapters
- (**Manga**) Fix showing an error on a manga refresh in case the manga does not have any chapters
- (**Manga**) Fix infinite loading on track search errors
- (**Manga**) Fix changing the status of a bound tracker
- (**Manga**) Fix unhandled line breaks in tracker search entry summaries
- (**Reader**) Fix handling of chapters without any pages
- (**Reader**) Fix scanlator name being included in readers chapter selection while there is only one scanlator for all chapters
- (**Reader**) Fix pages not loading for a corrupted downloaded chapter
- (**Reader**) Fix broken page retry button not doing anything for downloaded chapters
- (**Reader**) Fix horizontal reading mode having a vertical scrollbar
- (**Reader**) Fix blinking of pages in single and double page mode when opening the prev/next page
- (**Reader**) Fix blinking of pages in single and double page mode when opening the prev/next page in firefox
- (**Reader**) Fix some pages in double page mode from being rendered twice in some cases after a double spread page
- (**Reader**) Fix triggering downloading ahead for single page chapters
- (**Chapter**) Fix ASC and DESC sort of chapter list by chapter number (was switched: DESC instead of ASC and vice versa)
- (**Extensions**) Fix hidden extension action button (install, uninstall, ...) on smaller screens
- (**Library**) Fix showing continue read button for manga without available chapters
- (**Library**) Fix missing resume/continue read button in case latest chapter has been read and previous chapter was reuploaded
- (**Library**) Fix missing redirect ot tracker settings when clicking "track" action on a manga in case no tracker is bound to the manga and no tracker is currently logged in
- (**Library**) Fix library filter icon not always properly indicating that filters are active
- (**Library**) Fix incorrect library total size display
- (**Library**) Fix being unable to open category after re-ordering it
- (**Updates**) Fix sort order of chapters of same manga that have been fetched at the same time (previous: chapter number ascending - now: chapter number descending)
- (**Updates**) Fix missing error message in case chapter download could not be triggered
- (**Server update**) Fix dialog to inform about updated server version closing immediately
- (**Server update**) Fix dialog to inform about updated server version from never showing up
- (**WebUI update**) Fix dialog to inform about updated webUI version from never showing up
- (**Source**) Fix missing error message in case source configuration could not be changed
- (**Source**) Fix sorting of languages
- (**Source**) Fix infinite loading on source browse errors
- (**Source**) Fix not saving unsubmitted filters when saving a source search
- (**Source**) Fix losing saved applied filters from a saved search when opening a manga and going back to the source search
- (**Downloads**) Fix unresponsive UI while having a large download queue
- (**Downloads**) Fix download status not being shown while chapter is partially downloaded but not actively downloading
- (**Migrate**) Fix occasionally closing migration dialog while some sources are still searching
- (**Category**) Fix missing error message on category update/creation failure

### Translations
Feel free to translate the project on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/)

Thanks to everyone that contributed to the translation of this project.

#### Added
- Tamil (by தமிழ்நேரம்)
- Polish (by UnknownSkyrimPasserby)

#### Updated
- Chinese (Simplified) (by 清水汐音, Joshua Astray)
- Chinese (Traditional) (by plum7x, aaron mo)
- French (by Jean-Philippe ALLEGRO, Tycoon3819)
- German (by MK, Constantin Piber)
- Portuguese (by Leonardo de Macedo Sartorello, lucas Christofaro, Kaleb, Henrique)
- Russian (by Костин Ярослав (RikKos), Hajvk “Sqiqk” Lkaj)
- Spanish (by Fordas, Deleted User, zeedif)
- Turkish (by Oxara, m.a.tecik, Mustafa Değerli)
- Vietnamese (by Nguyễn Trung Đức, PandaKewt)

#### Removed (less than 75% translated)
- "Arabic (ar)" (71.7%)
- "Bengali (bn)" (1.8%)
- "Danish (da)" (13.6%)
- "Filipino (fil)" (16.2%)
- "Gan (Traditional Han script) (gan-Hant)" (0%)
- "Indonesian (id)" (22%)
- "Italian (it)" (69.4%)
- "Japanese (ja)" (56.8%)
- "Korean (ko)" (13%)
- "Norwegian Bokmål (nb-NO)" (1.3%)
- "Dutch (nl)" (44.9%)
- "Portuguese (Brazil) (pt-BR)" (32.4%)
- "Swedish (sv)" (2%)
- "Thai (th)" (28.5%)
- "Ukrainian (uk)" (54.9%)
- "Cantonese (Traditional Han script) (yue-Hant)" (0%)

### Contributors
Thanks to everyone that contributed to this release

@schroda, @weblate, @cpiber, @infyProductions, @leollo98, @dejavui, @UnknownSkyrimPasserby, @plum7x, @aizhimoran, @ykxkykx, @HanJoJ, @jicedtea, @Daviid-P, @kalebC, @TamilNeram, @Duoduo12138, @crystailx, @Banchon999, @jesusFx, @Runkandel, @lengzero, @tizio04, @zeedif, @Wybxc, @Mamotromico, @CladZo91, @senseimon1, @krizopraz, @mipo89-dev, @Robonau, @Meliodas-Sama, @991n1nd12, @RikCost, @JiPaix, @LycusCoder, @Oxara, @PandaKewt, @BrutuZ, @Yinr, @leqord, @RickyLam11, @Hada45, @gianlucalauro, @lucaschristofaro, @marimo-nekomimi

## [1.1.0] (r1689) - 2024-06-14

### Highlights
- Tracking support
- Different UI settings per device (e.g. reader settings)
- Save searches in source browse
- Chapter download selection improvement

### Added
- (**Internationalization**) Apply right to left styling for languages that are read right to left
- (**Library**) New setting to remove manga from categories when removing them from the library
- (**Library**) Filter library for manga that have bookmarked chapters
- (**Library**) Filter library for manga that have active track bindings for a tracker
- (**Browse**) Optionally hide in library manga from the results
- (**Browse**) Add/remove manga to/from the library directly on the source browse page
  - Via long press
  - Desktop only: click button which is shown while hovering a manga
- (**Browse**) When adding a manga to the library check for duplicates and show an info dialog
- (**Browse**) Added functionality to save searches (saved search name has a limit of 50 characters)
- (**Manga**) Added chapter list chapter menu action to open the chapter on the source site
- (**Manga**) Added tracking support
  - From manga page
  - From library
- (**Manga**) Copy manga title on long press in manga page
- (**Settings**) UI specific settings that are stored on the server are now saved per device (devices can be managed in the settings)
  - A device name is allowed to have 16 chars (a-Z, 0-9, -, _) (e.g. "My_Phone-1")
  - Device specific settings
    - Reader
      - Default settings
      - Settings per manga
    - Download
      - Download ahead while reading
- (**Settings**) Added a setting to find all duplicated entries in the library (Settings > Library)
- (**Updates**) Clicking on the thumbnail of an update card will open the manga page of the chapter
- (**Server update**) Inform about server version updates
- (**WebUI update**) Check for and open a dialog to inform about an available webUI update (only in case the "automatic webUI updates" setting is disabled, can be disabled (Settings > WebUI))
- (**Backup**) Inform about not logged in trackers when importing a backup with tracking data
- (**General**) Added retry button in case of loading errors
- (**Library**) While adding a manga to the library the category selection dialog can be disabled without going to the settings (setting only gets changed when "ok" gets clicked)
- (**Library**) Manga options menu can be opened via long press
- (**Manga**) Option to delete downloaded chapters of a manga when migrating
- (**Manga**) Last used migration options (include chapters, categories, delete downloaded) are saved
- (**Chapter**) Chapters option menu can be opened via long press
- (**Chapter**) Download button now opens a menu to choose the number of chapters to download
  - Next unread chapter
  - Next 5, 10, 25 unread chapters
  - Download ahead (downloads the next n unread chapters in case not enough unread and undownloaded chapters exist - based on the "download ahead while reading" setting)
  - Unread chapters
  - All chapters
- (**List/Grid item selection**) Select/deselect range of items between last clicked and clicked item
  - Via long press
  - Desktop only: shift + left click
- (**Reader**) Show live preview of reader width changes
- (**Reader**) Preload pages in single page mode
- (**Reader**) Chapter titles in the chapter selection now include the
  - Chapter number
  - Chapter title
  - Scanlator in case the current chapter list includes more than one scanlator
- (**Server update**) Added option to disable checks for a new server version (Settings > Server)
- (**Server update**) Added the following options to the info dialog
  - Remind later: closing the info dialog via "close" won't open the dialog for one hour
  - Ignore: won't open the dialog again for the available version update, in case a new version gets available, the dialog will be shown again
- (**WebUI update**) On a successful update a dialog gets opened (no matter the current page) which
  - Informs about the update
  - Provides an option to open the changelog
  - Refreshes the tab on close

### Changed
- (**Library**) The category selection dialog is not shown when adding a manga to the library without having created categories
- (**Library**) The current library manga selection now gets unselected after triggering an action
- (**Manga**) The continue read/resume button now uses the first unread chapter as the resume point
- (**Download**) The download queue clear button is now always enabled

### Fixed
- (**General**) Fix white screen on older browsers
- (**General**) Fix old data still being shown after
  - Changing the server url
  - Successfully importing a backup
- (**General**) Fix basic authentication not working when the server is on a different domain
- (**General**) Fix server being slow/"unresponsive" when triggering a lot of image requests
  - Allow only 5 parallel image requests
  - Abort pending image requests once they are not needed anymore
- (**General**) Fix missing loading placeholders in some pages
- (**General**) Fix infinite loading placeholders in some pages
- (**General**) Fix back button loop when opening a page that has a depth greater than 2 as the initial page
- (**Reader**) Fix resuming the last read page of a chapter when opening the reader in the vertical or horizontal mode
- (**Reader**) Fix image loading placeholders not having a proper width in the horizontal mode
- (**Reader**) Fix duplicated chapters not getting marked as read in case the "skip duplicated chapters" setting is enabled
- (**Reader**) Fix losing initial scanlator for duplication detection after opening the previous/next chapter
- (**Reader**) Fix opening previous website when closing the reader when the reader was opened as the initial webUI page
- (**Backup**) Fix backup creation button opening a blank page instead of creating and downloading a backup
- (**Library**) Fix adding a manga to the default categories when adding it to the library without the category selection dialog
- (**Library**) Fix sort by "latest uploaded chapter" sorting by "latest fetched chapter" instead
- (**Manga**) Fix showing the migrate action in the manga page for a non-library manga on large screens
- (**Manga**) Fix opening the migration search page when clicking the back button after a successful migration
- (**Manga**) Fix "open source" button being clickable while the manga source url is not available
- (**Chapter**) Fix deleting a bookmarked chapter when manually marking a chapter as read while the setting is disabled
- (**Settings**) Fix SOCKS and basic auth settings not being editable while they are disabled
- (**Settings**) Fix empty app language selection
- (**Settings**) Fix empty server url in case it hasn't been set yet (will be shown as the current origin)
- (**Settings**) Fix accidental deletion of downloaded manga thumbnails when clearing the server cache
- (**Backup**) Fix navigation to install missing sources on a backup validation issue
- (**Manga grid**) Fix jittering/flickering of manga grid items

### Translations
Feel free to translate the project on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/)

Thanks to everyone that contributed to the translation of this project.

#### Added
- Norwegian Bokmål (by VR Kek)
- Swedish (by Alexander)
- Turkish (by Efe Devirgen)
- Russian (by Василий, Darkon Rabbit, yaki)
- Bengali (by Akhlak Ur Rahman)

#### Updated
- Chinese (Simplified) (by 清水汐音, Kouki Kitamura)
- Italian (by tizio04, Roberto Palmese)
- Japanese (by marimo, Siamese)
- Chinese (Traditional) (by plum7x, guohuageng)
- Ukrainian (by Danylo Gavrylenko)
- Spanish (by gallegonovato, Fordas)
- Portuguese (by Leonardo de Macedo Sartorello, Gabriel Severo)
- German (by Son of the Rocks)
- Vietnamese (by PandaKewt, Nguyễn Trung Đức)
- French (by Graham Morin)
- Indonesian (by Axel C)

### Contributors
Thanks to everyone that contributed to this release

@leollo98, @kiritsumafuyu, @marimo-nekomimi, @tizio04, @aizhimoran, @schroda, @akhlakurrahman1011, @xxx1SET1xxx, @jesusFx, @SySen04, @dejavui, @JoHena, @jintaxi, @okpo2188513, @axlchr12, @Lafrend, @EfeDevirgen, @HugoLeBoennec, @PandaKewt, @rpalmese, @ZerOri, @Xsrt251, @plum7x, @GR2066878693, @taos15, @Topru333, @chancez, @MageSneaky, @Azokul01, @gabrielssevero, @0QwQ0, @Rintan, @zyzz8520, @guohuageng

## [1.0.0] (r1411) - 2024-02-23

### Added
- (**General**) Added internationalization (help translating on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/))
- (**General**) Get notified when a new server version has been released
- (**General**) Manually check for new versions (server and webUI)
- (**Download**) Download ahead: automatically download next unread chapters while reading (requires the current and next chapters to be downloaded)
- (**Download**) Automatically delete downloaded chapters after reading
- (**Download**) Automatically delete downloaded chapters when manually marking them as read
- (**Download**) Prevent automatic deletion of bookmarked chapters
- (**Library**) Migrate manga between sources
- (**Library**) Improved library management (single and bulk actions)
  - Download
  - Delete
  - Mark as read
  - Mark as unread
  - Migrate (single action only)
  - Change categories
  - Remove from library
- (**Library**) Search by genre (`genre1, genre2 genre3, ...`, e.g.: `action, adventure, fantasy`)
- (**Library**) Sort options
  - By last read
  - By latest fetched chapter
  - By latest uploaded chapter
- (**Library**) Show number of manga in whole library and each category (these numbers are based on category manga and will include non library manga)
- (**Library**) Optional continue read button
- (**Reader**) Added new settings
  - Skip duplicate chapters (opens the previous/next chapter from the same scanlator as the current one if it exists)
  - Fit page to window
  - Scale small pages (only when "fit page to window" is enabled)
  - Reader width (only when "fit page to window" is disabled)
  - Double page mode: offset first page
- (**Reader**) Retry failed image requests button
- (**Settings**) Server settings can now be changed from the UI

### Fixed
- A lot (and added new ones for the future, lul)

### Translations
Feel free to translate the project on [Weblate](https://hosted.weblate.org/projects/suwayomi/suwayomi-webui/).

Thanks to everyone that contributed to the translation of this project.

#### Added
- Arabic (by abdelbasset jabrane, Bander AL-shreef)
- Chinese (Simplified) (by misaka10843, 蓝云Reyes, Nite07, 志明, ccms, 宮河ひより, 清水汐音, DevCoz)
- Chinese (Traditional) (by plum7x, 蓝云Reyes)
- French (by Nathan, Alexandre Journet, anvstin)
- German (by Fumo Vite)
- Indonesian (by Rafie Rafie)
- Italian (by Wip -Sama (Wip-Sama SmasterMega))
- Japanese (by Super Mario)
- Korean (by jun)
- Portuguese (by Shinzo wo name)
- Spanish (by gallegonovato, Yon, Fordas, Carlos Nahuel Morocho)
- Ukrainian (by Dan)
- Vietnamese (by xconkhi9x)

### Contributors
Thanks to everyone that contributed to this release

@schroda, @jesusFx, @QuietBlade, @anvstin, @guohuageng, @plum7x, @HiyoriTUK, @aizhimoran, @JiPaix, @Yuhyeong, @a18ccms, @chancez, @rickymcmuffin, @zmmx, @alexandrejournet, @ibaraki-douji, @nitezs, @misaka10843, @Becods, @skrewde, @xconkhi9x, @cnmorocho, @Wip-Sama, @Kefir2105, @RafieHardinur, @SuperMario229, @Alexandre-P-J, @AriaMoradi, @NathanBnm, @FumoVite, @JoHena, @bandysharif, @DevCoz, @comradekingu, @Zereef, @akabhirav

[unreleased]: https://github.com/suwayomi/suwayomi-webui/compare/v20250801.01...HEAD
[20250801.01]: https://github.com/suwayomi/suwayomi-webui/compare/v20250731.01...v20250801.01
[20250731.01]: https://github.com/suwayomi/suwayomi-webui/compare/v20250703.01...v20250731.01
[20250703.01]: https://github.com/suwayomi/suwayomi-webui/compare/v1.5.1...v20250703.01
[1.5.1]: https://github.com/suwayomi/suwayomi-webui/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/suwayomi/suwayomi-webui/compare/v1.1.0...v1.5.0
[1.1.0]: https://github.com/suwayomi/suwayomi-webui/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/suwayomi/suwayomi-webui/releases/tag/v1.0.0
