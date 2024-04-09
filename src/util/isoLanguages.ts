/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const loadDefaultDayJsLocale = () => import('dayjs/locale/en.js');

export type ISOLanguageCode = string;

export type ISOLanguage = {
    name: string;
    nativeName: string;
    dayjsImport: () => Promise<any>;
};

// full list: https://github.com/meikidd/iso-639-1/blob/master/src/data.js
export const ISOLanguages: Record<ISOLanguageCode, ISOLanguage> = {
    // #############################
    // ###                       ###
    // ### START: manually added ###
    // ###                       ###
    // #############################
    'es-419': {
        name: 'Spanish; Castilian',
        nativeName: 'Español',
        dayjsImport: () => import('dayjs/locale/es.js'),
    },
    'pt-pt': {
        name: 'Portuguese',
        nativeName: 'Português (Portugal)',
        dayjsImport: () => import('dayjs/locale/pt.js'),
    },
    'pt-br': {
        name: 'Portuguese; Brasil',
        nativeName: 'Português (Brasil)',
        dayjsImport: () => import('dayjs/locale/pt-br.js'),
    },
    'zh-hans': {
        name: 'Chinese (Simplified)',
        nativeName: '中文 (HANS)',
        dayjsImport: () => import('dayjs/locale/zh-cn.js'),
    },
    'zh-hant': {
        name: 'Chinese (Traditional)',
        nativeName: '中文 (HANT)',
        dayjsImport: () => import('dayjs/locale/zh-hk.js'),
    },
    'zh-rhk': {
        name: 'Chinese',
        nativeName: '中文 (RHK)',
        dayjsImport: () => import('dayjs/locale/zh-hk.js'),
    },
    'zh-rtw': {
        name: 'Chinese',
        nativeName: '中文 (RTW)',
        dayjsImport: () => import('dayjs/locale/zh-tw.js'),
    },
    fil: {
        name: 'Filipino',
        nativeName: 'Filipino',
        dayjsImport: () => import('dayjs/locale/tl-ph'),
    },
    sh: {
        name: 'Serbo-Croatian',
        nativeName: 'srpskohrvatski',
        dayjsImport: loadDefaultDayJsLocale,
    },
    'nb-NO': {
        name: 'Norwegian Bokmål',
        nativeName: 'Norsk bokmål',
        dayjsImport: () => import('dayjs/locale/nb.js'),
    },
    // #############################
    // ###                       ###
    // ### END: manually added   ###
    // ###                       ###
    // #############################
    aa: {
        name: 'Afar',
        nativeName: 'Afaraf',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ab: {
        name: 'Abkhaz',
        nativeName: 'аҧсуа бызшәа',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ae: {
        name: 'Avestan',
        nativeName: 'avesta',
        dayjsImport: loadDefaultDayJsLocale,
    },
    af: {
        name: 'Afrikaans',
        nativeName: 'Afrikaans',
        dayjsImport: () => import('dayjs/locale/af.js'),
    },
    ak: {
        name: 'Akan',
        nativeName: 'Akan',
        dayjsImport: loadDefaultDayJsLocale,
    },
    am: {
        name: 'Amharic',
        nativeName: 'አማርኛ',
        dayjsImport: () => import('dayjs/locale/am.js'),
    },
    an: {
        name: 'Aragonese',
        nativeName: 'aragonés',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ar: {
        name: 'Arabic',
        nativeName: 'اَلْعَرَبِيَّةُ',
        dayjsImport: () => import('dayjs/locale/ar.js'),
    },
    as: {
        name: 'Assamese',
        nativeName: 'অসমীয়া',
        dayjsImport: loadDefaultDayJsLocale,
    },
    av: {
        name: 'Avaric',
        nativeName: 'авар мацӀ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ay: {
        name: 'Aymara',
        nativeName: 'aymar aru',
        dayjsImport: loadDefaultDayJsLocale,
    },
    az: {
        name: 'Azerbaijani',
        nativeName: 'azərbaycan dili',
        dayjsImport: () => import('dayjs/locale/az.js'),
    },
    ba: {
        name: 'Bashkir',
        nativeName: 'башҡорт теле',
        dayjsImport: loadDefaultDayJsLocale,
    },
    be: {
        name: 'Belarusian',
        nativeName: 'беларуская мова',
        dayjsImport: () => import('dayjs/locale/be.js'),
    },
    bg: {
        name: 'Bulgarian',
        nativeName: 'български език',
        dayjsImport: () => import('dayjs/locale/bg.js'),
    },
    bi: {
        name: 'Bislama',
        nativeName: 'Bislama',
        dayjsImport: () => import('dayjs/locale/bi.js'),
    },
    bm: {
        name: 'Bambara',
        nativeName: 'bamanankan',
        dayjsImport: () => import('dayjs/locale/bm.js'),
    },
    bn: {
        name: 'Bengali',
        nativeName: 'বাংলা',
        dayjsImport: () => import('dayjs/locale/bn.js'),
    },
    bo: {
        name: 'Tibetan',
        nativeName: 'བོད་ཡིག',
        dayjsImport: () => import('dayjs/locale/bo.js'),
    },
    br: {
        name: 'Breton',
        nativeName: 'brezhoneg',
        dayjsImport: () => import('dayjs/locale/br.js'),
    },
    bs: {
        name: 'Bosnian',
        nativeName: 'bosanski jezik',
        dayjsImport: () => import('dayjs/locale/bs.js'),
    },
    ca: {
        name: 'Catalan',
        nativeName: 'Català',
        dayjsImport: () => import('dayjs/locale/ca.js'),
    },
    ce: {
        name: 'Chechen',
        nativeName: 'нохчийн мотт',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ch: {
        name: 'Chamorro',
        nativeName: 'Chamoru',
        dayjsImport: loadDefaultDayJsLocale,
    },
    co: {
        name: 'Corsican',
        nativeName: 'corsu',
        dayjsImport: loadDefaultDayJsLocale,
    },
    cr: {
        name: 'Cree',
        nativeName: 'ᓀᐦᐃᔭᐍᐏᐣ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    cs: {
        name: 'Czech',
        nativeName: 'čeština',
        dayjsImport: () => import('dayjs/locale/cs.js'),
    },
    cu: {
        name: 'Old Church Slavonic',
        nativeName: 'ѩзыкъ словѣньскъ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    cv: {
        name: 'Chuvash',
        nativeName: 'чӑваш чӗлхи',
        dayjsImport: () => import('dayjs/locale/cv.js'),
    },
    cy: {
        name: 'Welsh',
        nativeName: 'Cymraeg',
        dayjsImport: () => import('dayjs/locale/cy.js'),
    },
    da: {
        name: 'Danish',
        nativeName: 'Dansk',
        dayjsImport: () => import('dayjs/locale/da.js'),
    },
    de: {
        name: 'German',
        nativeName: 'Deutsch',
        dayjsImport: () => import('dayjs/locale/de.js'),
    },
    dv: {
        name: 'Divehi',
        nativeName: 'ދިވެހި',
        dayjsImport: () => import('dayjs/locale/dv.js'),
    },
    dz: {
        name: 'Dzongkha',
        nativeName: 'རྫོང་ཁ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ee: {
        name: 'Ewe',
        nativeName: 'Eʋegbe',
        dayjsImport: loadDefaultDayJsLocale,
    },
    el: {
        name: 'Greek',
        nativeName: 'Ελληνικά',
        dayjsImport: () => import('dayjs/locale/el.js'),
    },
    en: {
        name: 'English',
        nativeName: 'English',
        dayjsImport: loadDefaultDayJsLocale,
    },
    eo: {
        name: 'Esperanto',
        nativeName: 'Esperanto',
        dayjsImport: () => import('dayjs/locale/eo.js'),
    },
    es: {
        name: 'Spanish',
        nativeName: 'Español',
        dayjsImport: () => import('dayjs/locale/es.js'),
    },
    et: {
        name: 'Estonian',
        nativeName: 'eesti',
        dayjsImport: () => import('dayjs/locale/et.js'),
    },
    eu: {
        name: 'Basque',
        nativeName: 'euskara',
        dayjsImport: () => import('dayjs/locale/eu.js'),
    },
    fa: {
        name: 'Persian',
        nativeName: 'فارسی',
        dayjsImport: () => import('dayjs/locale/fa.js'),
    },
    ff: {
        name: 'Fula',
        nativeName: 'Fulfulde',
        dayjsImport: loadDefaultDayJsLocale,
    },
    fi: {
        name: 'Finnish',
        nativeName: 'suomi',
        dayjsImport: () => import('dayjs/locale/fi.js'),
    },
    fj: {
        name: 'Fijian',
        nativeName: 'vosa Vakaviti',
        dayjsImport: loadDefaultDayJsLocale,
    },
    fo: {
        name: 'Faroese',
        nativeName: 'Føroyskt',
        dayjsImport: () => import('dayjs/locale/fo.js'),
    },
    fr: {
        name: 'French',
        nativeName: 'Français',
        dayjsImport: () => import('dayjs/locale/fr.js'),
    },
    fy: {
        name: 'Western Frisian',
        nativeName: 'Frysk',
        dayjsImport: () => import('dayjs/locale/fy.js'),
    },
    ga: {
        name: 'Irish',
        nativeName: 'Gaeilge',
        dayjsImport: () => import('dayjs/locale/ga.js'),
    },
    gd: {
        name: 'Scottish Gaelic',
        nativeName: 'Gàidhlig',
        dayjsImport: () => import('dayjs/locale/gd.js'),
    },
    gl: {
        name: 'Galician',
        nativeName: 'galego',
        dayjsImport: () => import('dayjs/locale/gl.js'),
    },
    gn: {
        name: 'Guaraní',
        nativeName: "Avañe'ẽ",
        dayjsImport: loadDefaultDayJsLocale,
    },
    gu: {
        name: 'Gujarati',
        nativeName: 'ગુજરાતી',
        dayjsImport: () => import('dayjs/locale/gu.js'),
    },
    gv: {
        name: 'Manx',
        nativeName: 'Gaelg',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ha: {
        name: 'Hausa',
        nativeName: 'هَوُسَ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    he: {
        name: 'Hebrew',
        nativeName: 'עברית',
        dayjsImport: () => import('dayjs/locale/he.js'),
    },
    hi: {
        name: 'Hindi',
        nativeName: 'हिन्दी',
        dayjsImport: () => import('dayjs/locale/hi.js'),
    },
    ho: {
        name: 'Hiri Motu',
        nativeName: 'Hiri Motu',
        dayjsImport: loadDefaultDayJsLocale,
    },
    hr: {
        name: 'Croatian',
        nativeName: 'Hrvatski',
        dayjsImport: () => import('dayjs/locale/hr.js'),
    },
    ht: {
        name: 'Haitian',
        nativeName: 'Kreyòl ayisyen',
        dayjsImport: () => import('dayjs/locale/ht.js'),
    },
    hu: {
        name: 'Hungarian',
        nativeName: 'magyar',
        dayjsImport: () => import('dayjs/locale/hu.js'),
    },
    hy: {
        name: 'Armenian',
        nativeName: 'Հայերեն',
        dayjsImport: loadDefaultDayJsLocale,
    },
    hz: {
        name: 'Herero',
        nativeName: 'Otjiherero',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ia: {
        name: 'Interlingua',
        nativeName: 'Interlingua',
        dayjsImport: loadDefaultDayJsLocale,
    },
    id: {
        name: 'Indonesian',
        nativeName: 'Bahasa Indonesia',
        dayjsImport: () => import('dayjs/locale/id.js'),
    },
    ie: {
        name: 'Interlingue',
        nativeName: 'Interlingue',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ig: {
        name: 'Igbo',
        nativeName: 'Asụsụ Igbo',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ii: {
        name: 'Nuosu',
        nativeName: 'ꆈꌠ꒿ Nuosuhxop',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ik: {
        name: 'Inupiaq',
        nativeName: 'Iñupiaq',
        dayjsImport: loadDefaultDayJsLocale,
    },
    io: {
        name: 'Ido',
        nativeName: 'Ido',
        dayjsImport: loadDefaultDayJsLocale,
    },
    is: {
        name: 'Icelandic',
        nativeName: 'Íslenska',
        dayjsImport: () => import('dayjs/locale/is.js'),
    },
    it: {
        name: 'Italian',
        nativeName: 'Italiano',
        dayjsImport: () => import('dayjs/locale/it.js'),
    },
    iu: {
        name: 'Inuktitut',
        nativeName: 'ᐃᓄᒃᑎᑐᑦ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ja: {
        name: 'Japanese',
        nativeName: '日本語',
        dayjsImport: () => import('dayjs/locale/ja.js'),
    },
    jv: {
        name: 'Javanese',
        nativeName: 'basa Jawa',
        dayjsImport: () => import('dayjs/locale/jv.js'),
    },
    ka: {
        name: 'Georgian',
        nativeName: 'ქართული',
        dayjsImport: () => import('dayjs/locale/ka.js'),
    },
    kg: {
        name: 'Kongo',
        nativeName: 'Kikongo',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ki: {
        name: 'Kikuyu',
        nativeName: 'Gĩkũyũ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    kj: {
        name: 'Kwanyama',
        nativeName: 'Kuanyama',
        dayjsImport: loadDefaultDayJsLocale,
    },
    kk: {
        name: 'Kazakh',
        nativeName: 'қазақ тілі',
        dayjsImport: () => import('dayjs/locale/kk.js'),
    },
    kl: {
        name: 'Kalaallisut',
        nativeName: 'kalaallisut',
        dayjsImport: loadDefaultDayJsLocale,
    },
    km: {
        name: 'Khmer',
        nativeName: 'ខេមរភាសា',
        dayjsImport: () => import('dayjs/locale/km.js'),
    },
    kn: {
        name: 'Kannada',
        nativeName: 'ಕನ್ನಡ',
        dayjsImport: () => import('dayjs/locale/kn.js'),
    },
    ko: {
        name: 'Korean',
        nativeName: '한국어',
        dayjsImport: () => import('dayjs/locale/ko.js'),
    },
    kr: {
        name: 'Kanuri',
        nativeName: 'Kanuri',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ks: {
        name: 'Kashmiri',
        nativeName: 'कश्मीरी',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ku: {
        name: 'Kurdish',
        nativeName: 'Kurdî',
        dayjsImport: () => import('dayjs/locale/ku.js'),
    },
    kv: {
        name: 'Komi',
        nativeName: 'коми кыв',
        dayjsImport: loadDefaultDayJsLocale,
    },
    kw: {
        name: 'Cornish',
        nativeName: 'Kernewek',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ky: {
        name: 'Kyrgyz',
        nativeName: 'Кыргызча',
        dayjsImport: () => import('dayjs/locale/ky.js'),
    },
    la: {
        name: 'Latin',
        nativeName: 'latine',
        dayjsImport: loadDefaultDayJsLocale,
    },
    lb: {
        name: 'Luxembourgish',
        nativeName: 'Lëtzebuergesch',
        dayjsImport: () => import('dayjs/locale/lb.js'),
    },
    lg: {
        name: 'Ganda',
        nativeName: 'Luganda',
        dayjsImport: loadDefaultDayJsLocale,
    },
    li: {
        name: 'Limburgish',
        nativeName: 'Limburgs',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ln: {
        name: 'Lingala',
        nativeName: 'Lingála',
        dayjsImport: loadDefaultDayJsLocale,
    },
    lo: {
        name: 'Lao',
        nativeName: 'ພາສາລາວ',
        dayjsImport: () => import('dayjs/locale/lo.js'),
    },
    lt: {
        name: 'Lithuanian',
        nativeName: 'lietuvių kalba',
        dayjsImport: () => import('dayjs/locale/lt.js'),
    },
    lu: {
        name: 'Luba-Katanga',
        nativeName: 'Kiluba',
        dayjsImport: loadDefaultDayJsLocale,
    },
    lv: {
        name: 'Latvian',
        nativeName: 'latviešu valoda',
        dayjsImport: () => import('dayjs/locale/lv.js'),
    },
    mg: {
        name: 'Malagasy',
        nativeName: 'fiteny malagasy',
        dayjsImport: loadDefaultDayJsLocale,
    },
    mh: {
        name: 'Marshallese',
        nativeName: 'Kajin M̧ajeļ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    mi: {
        name: 'Māori',
        nativeName: 'te reo Māori',
        dayjsImport: () => import('dayjs/locale/mi.js'),
    },
    mk: {
        name: 'Macedonian',
        nativeName: 'македонски јазик',
        dayjsImport: () => import('dayjs/locale/mk.js'),
    },
    ml: {
        name: 'Malayalam',
        nativeName: 'മലയാളം',
        dayjsImport: () => import('dayjs/locale/ml.js'),
    },
    mn: {
        name: 'Mongolian',
        nativeName: 'Монгол хэл',
        dayjsImport: () => import('dayjs/locale/mn.js'),
    },
    mr: {
        name: 'Marathi',
        nativeName: 'मराठी',
        dayjsImport: () => import('dayjs/locale/mr.js'),
    },
    ms: {
        name: 'Malay',
        nativeName: 'Bahasa Melayu',
        dayjsImport: () => import('dayjs/locale/ms.js'),
    },
    mt: {
        name: 'Maltese',
        nativeName: 'Malti',
        dayjsImport: () => import('dayjs/locale/mt.js'),
    },
    my: {
        name: 'Burmese',
        nativeName: 'ဗမာစာ',
        dayjsImport: () => import('dayjs/locale/my.js'),
    },
    na: {
        name: 'Nauru',
        nativeName: 'Dorerin Naoero',
        dayjsImport: loadDefaultDayJsLocale,
    },
    nb: {
        name: 'Norwegian Bokmål',
        nativeName: 'Norsk bokmål',
        dayjsImport: () => import('dayjs/locale/nb.js'),
    },
    nd: {
        name: 'Northern Ndebele',
        nativeName: 'isiNdebele',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ne: {
        name: 'Nepali',
        nativeName: 'नेपाली',
        dayjsImport: () => import('dayjs/locale/ne.js'),
    },
    ng: {
        name: 'Ndonga',
        nativeName: 'Owambo',
        dayjsImport: loadDefaultDayJsLocale,
    },
    nl: {
        name: 'Dutch',
        nativeName: 'Nederlands',
        dayjsImport: () => import('dayjs/locale/nl.js'),
    },
    nn: {
        name: 'Norwegian Nynorsk',
        nativeName: 'Norsk nynorsk',
        dayjsImport: () => import('dayjs/locale/nn.js'),
    },
    no: {
        name: 'Norwegian',
        nativeName: 'Norsk',
        dayjsImport: loadDefaultDayJsLocale,
    },
    nr: {
        name: 'Southern Ndebele',
        nativeName: 'isiNdebele',
        dayjsImport: loadDefaultDayJsLocale,
    },
    nv: {
        name: 'Navajo',
        nativeName: 'Diné bizaad',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ny: {
        name: 'Chichewa',
        nativeName: 'chiCheŵa',
        dayjsImport: loadDefaultDayJsLocale,
    },
    oc: {
        name: 'Occitan',
        nativeName: 'occitan',
        dayjsImport: loadDefaultDayJsLocale,
    },
    oj: {
        name: 'Ojibwe',
        nativeName: 'ᐊᓂᔑᓈᐯᒧᐎᓐ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    om: {
        name: 'Oromo',
        nativeName: 'Afaan Oromoo',
        dayjsImport: loadDefaultDayJsLocale,
    },
    or: {
        name: 'Oriya',
        nativeName: 'ଓଡ଼ିଆ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    os: {
        name: 'Ossetian',
        nativeName: 'ирон æвзаг',
        dayjsImport: loadDefaultDayJsLocale,
    },
    pa: {
        name: 'Panjabi',
        nativeName: 'ਪੰਜਾਬੀ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    pi: {
        name: 'Pāli',
        nativeName: 'पाऴि',
        dayjsImport: loadDefaultDayJsLocale,
    },
    pl: {
        name: 'Polish',
        nativeName: 'Polski',
        dayjsImport: () => import('dayjs/locale/pl.js'),
    },
    ps: {
        name: 'Pashto',
        nativeName: 'پښتو',
        dayjsImport: loadDefaultDayJsLocale,
    },
    pt: {
        name: 'Portuguese',
        nativeName: 'Português',
        dayjsImport: () => import('dayjs/locale/pt.js'),
    },
    qu: {
        name: 'Quechua',
        nativeName: 'Runa Simi',
        dayjsImport: loadDefaultDayJsLocale,

        // asdfasdfasdfasdf
    },
    rm: {
        name: 'Romansh',
        nativeName: 'rumantsch grischun',
        dayjsImport: () => import('dayjs/locale/cs.js'),
    },
    rn: {
        name: 'Kirundi',
        nativeName: 'Ikirundi',
        dayjsImport: () => import('dayjs/locale/cs.js'),
    },
    ro: {
        name: 'Romanian',
        nativeName: 'Română',
        dayjsImport: () => import('dayjs/locale/ro.js'),
    },
    ru: {
        name: 'Russian',
        nativeName: 'Русский',
        dayjsImport: () => import('dayjs/locale/ru.js'),
    },
    rw: {
        name: 'Kinyarwanda',
        nativeName: 'Ikinyarwanda',
        dayjsImport: () => import('dayjs/locale/rw.js'),
    },
    sa: {
        name: 'Sanskrit',
        nativeName: 'संस्कृतम्',
        dayjsImport: loadDefaultDayJsLocale,
    },
    sc: {
        name: 'Sardinian',
        nativeName: 'sardu',
        dayjsImport: loadDefaultDayJsLocale,
    },
    sd: {
        name: 'Sindhi',
        nativeName: 'सिन्धी',
        dayjsImport: () => import('dayjs/locale/sd.js'),
    },
    se: {
        name: 'Northern Sami',
        nativeName: 'Davvisámegiella',
        dayjsImport: () => import('dayjs/locale/se.js'),
    },
    sg: {
        name: 'Sango',
        nativeName: 'yângâ tî sängö',
        dayjsImport: loadDefaultDayJsLocale,
    },
    si: {
        name: 'Sinhala',
        nativeName: 'සිංහල',
        dayjsImport: () => import('dayjs/locale/si.js'),
    },
    sk: {
        name: 'Slovak',
        nativeName: 'slovenčina',
        dayjsImport: () => import('dayjs/locale/sk.js'),
    },
    sl: {
        name: 'Slovenian',
        nativeName: 'slovenščina',
        dayjsImport: () => import('dayjs/locale/sl.js'),
    },
    sm: {
        name: 'Samoan',
        nativeName: "gagana fa'a Samoa",
        dayjsImport: loadDefaultDayJsLocale,
    },
    sn: {
        name: 'Shona',
        nativeName: 'chiShona',
        dayjsImport: loadDefaultDayJsLocale,
    },
    so: {
        name: 'Somali',
        nativeName: 'Soomaaliga',
        dayjsImport: loadDefaultDayJsLocale,
    },
    sq: {
        name: 'Albanian',
        nativeName: 'Shqip',
        dayjsImport: () => import('dayjs/locale/sq.js'),
    },
    sr: {
        name: 'Serbian',
        nativeName: 'српски језик',
        dayjsImport: () => import('dayjs/locale/sr.js'),
    },
    ss: {
        name: 'Swati',
        nativeName: 'SiSwati',
        dayjsImport: () => import('dayjs/locale/ss.js'),
    },
    st: {
        name: 'Southern Sotho',
        nativeName: 'Sesotho',
        dayjsImport: loadDefaultDayJsLocale,
    },
    su: {
        name: 'Sundanese',
        nativeName: 'Basa Sunda',
        dayjsImport: loadDefaultDayJsLocale,
    },
    sv: {
        name: 'Swedish',
        nativeName: 'Svenska',
        dayjsImport: () => import('dayjs/locale/sv.js'),
    },
    sw: {
        name: 'Swahili',
        nativeName: 'Kiswahili',
        dayjsImport: () => import('dayjs/locale/sw.js'),
    },
    ta: {
        name: 'Tamil',
        nativeName: 'தமிழ்',
        dayjsImport: () => import('dayjs/locale/ta.js'),
    },
    te: {
        name: 'Telugu',
        nativeName: 'తెలుగు',
        dayjsImport: () => import('dayjs/locale/te.js'),
    },
    tg: {
        name: 'Tajik',
        nativeName: 'тоҷикӣ',
        dayjsImport: () => import('dayjs/locale/tg.js'),
    },
    th: {
        name: 'Thai',
        nativeName: 'ไทย',
        dayjsImport: () => import('dayjs/locale/th.js'),
    },
    ti: {
        name: 'Tigrinya',
        nativeName: 'ትግርኛ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    tk: {
        name: 'Turkmen',
        nativeName: 'Türkmençe',
        dayjsImport: () => import('dayjs/locale/tk.js'),
    },
    tl: {
        name: 'Tagalog',
        nativeName: 'Wikang Tagalog',
        dayjsImport: loadDefaultDayJsLocale,
    },
    tn: {
        name: 'Tswana',
        nativeName: 'Setswana',
        dayjsImport: loadDefaultDayJsLocale,
    },
    to: {
        name: 'Tonga',
        nativeName: 'faka Tonga',
        dayjsImport: loadDefaultDayJsLocale,
    },
    tr: {
        name: 'Turkish',
        nativeName: 'Türkçe',
        dayjsImport: () => import('dayjs/locale/tr.js'),
    },
    ts: {
        name: 'Tsonga',
        nativeName: 'Xitsonga',
        dayjsImport: loadDefaultDayJsLocale,
    },
    tt: {
        name: 'Tatar',
        nativeName: 'татар теле',
        dayjsImport: loadDefaultDayJsLocale,
    },
    tw: {
        name: 'Twi',
        nativeName: 'Twi',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ty: {
        name: 'Tahitian',
        nativeName: 'Reo Tahiti',
        dayjsImport: loadDefaultDayJsLocale,
    },
    ug: {
        name: 'Uyghur',
        nativeName: 'ئۇيغۇرچە‎',
        dayjsImport: loadDefaultDayJsLocale,
    },
    uk: {
        name: 'Ukrainian',
        nativeName: 'Українська',
        dayjsImport: () => import('dayjs/locale/uk.js'),
    },
    ur: {
        name: 'Urdu',
        nativeName: 'اردو',
        dayjsImport: () => import('dayjs/locale/ur.js'),
    },
    uz: {
        name: 'Uzbek',
        nativeName: 'Ўзбек',
        dayjsImport: () => import('dayjs/locale/uz.js'),
    },
    ve: {
        name: 'Venda',
        nativeName: 'Tshivenḓa',
        dayjsImport: loadDefaultDayJsLocale,
    },
    vi: {
        name: 'Vietnamese',
        nativeName: 'Tiếng Việt',
        dayjsImport: () => import('dayjs/locale/vi.js'),
    },
    vo: {
        name: 'Volapük',
        nativeName: 'Volapük',
        dayjsImport: loadDefaultDayJsLocale,
    },
    wa: {
        name: 'Walloon',
        nativeName: 'walon',
        dayjsImport: loadDefaultDayJsLocale,
    },
    wo: {
        name: 'Wolof',
        nativeName: 'Wollof',
        dayjsImport: loadDefaultDayJsLocale,
    },
    xh: {
        name: 'Xhosa',
        nativeName: 'isiXhosa',
        dayjsImport: loadDefaultDayJsLocale,
    },
    yi: {
        name: 'Yiddish',
        nativeName: 'ייִדיש',
        dayjsImport: loadDefaultDayJsLocale,
    },
    yo: {
        name: 'Yoruba',
        nativeName: 'Yorùbá',
        dayjsImport: () => import('dayjs/locale/yo.js'),
    },
    za: {
        name: 'Zhuang',
        nativeName: 'Saɯ cueŋƅ',
        dayjsImport: loadDefaultDayJsLocale,
    },
    zh: {
        name: 'Chinese',
        nativeName: '中文',
        dayjsImport: () => import('dayjs/locale/zh.js'),
    },
    zu: {
        name: 'Zulu',
        nativeName: 'isiZulu',
        dayjsImport: loadDefaultDayJsLocale,
    },
};
