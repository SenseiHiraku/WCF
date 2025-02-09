/**
 * Generates plural phrases for the `plural` template plugin.
 *
 * @author  Matthias Schmidt, Marcel Werk
 * @copyright  2001-2020 WoltLab GmbH
 * @license  GNU Lesser General Public License <http://opensource.org/licenses/lgpl-license.php>
 * @module  WoltLabSuite/Core/I18n/Plural
 */
define(["require", "exports", "tslib", "../StringUtil"], function (require, exports, tslib_1, StringUtil) {
    "use strict";
    StringUtil = tslib_1.__importStar(StringUtil);
    const Languages = {
        // Afrikaans
        af(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Amharic
        am(n) {
            const i = Math.floor(Math.abs(n));
            if (n == 1 || i === 0) {
                return "one" /* Category.One */;
            }
        },
        // Arabic
        ar(n) {
            if (n == 0) {
                return "zero" /* Category.Zero */;
            }
            if (n == 1) {
                return "one" /* Category.One */;
            }
            if (n == 2) {
                return "two" /* Category.Two */;
            }
            const mod100 = n % 100;
            if (mod100 >= 3 && mod100 <= 10) {
                return "few" /* Category.Few */;
            }
            if (mod100 >= 11 && mod100 <= 99) {
                return "many" /* Category.Many */;
            }
        },
        // Assamese
        as(n) {
            const i = Math.floor(Math.abs(n));
            if (n == 1 || i === 0) {
                return "one" /* Category.One */;
            }
        },
        // Azerbaijani
        az(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Belarusian
        be(n) {
            const mod10 = n % 10;
            const mod100 = n % 100;
            if (mod10 == 1 && mod100 != 11) {
                return "one" /* Category.One */;
            }
            if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
                return "few" /* Category.Few */;
            }
            if (mod10 == 0 || (mod10 >= 5 && mod10 <= 9) || (mod100 >= 11 && mod100 <= 14)) {
                return "many" /* Category.Many */;
            }
        },
        // Bulgarian
        bg(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Bengali
        bn(n) {
            const i = Math.floor(Math.abs(n));
            if (n == 1 || i === 0) {
                return "one" /* Category.One */;
            }
        },
        // Tibetan
        bo(_n) {
            return undefined;
        },
        // Bosnian
        bs(n) {
            const v = Plural.getV(n);
            const f = Plural.getF(n);
            const mod10 = n % 10;
            const mod100 = n % 100;
            const fMod10 = f % 10;
            const fMod100 = f % 100;
            if ((v == 0 && mod10 == 1 && mod100 != 11) || (fMod10 == 1 && fMod100 != 11)) {
                return "one" /* Category.One */;
            }
            if ((v == 0 && mod10 >= 2 && mod10 <= 4 && mod100 >= 12 && mod100 <= 14) ||
                (fMod10 >= 2 && fMod10 <= 4 && fMod100 >= 12 && fMod100 <= 14)) {
                return "few" /* Category.Few */;
            }
        },
        // Czech
        cs(n) {
            const v = Plural.getV(n);
            if (n == 1 && v === 0) {
                return "one" /* Category.One */;
            }
            if (n >= 2 && n <= 4 && v === 0) {
                return "few" /* Category.Few */;
            }
            if (v === 0) {
                return "many" /* Category.Many */;
            }
        },
        // Welsh
        cy(n) {
            if (n == 0) {
                return "zero" /* Category.Zero */;
            }
            if (n == 1) {
                return "one" /* Category.One */;
            }
            if (n == 2) {
                return "two" /* Category.Two */;
            }
            if (n == 3) {
                return "few" /* Category.Few */;
            }
            if (n == 6) {
                return "many" /* Category.Many */;
            }
        },
        // Danish
        da(n) {
            if (n > 0 && n < 2) {
                return "one" /* Category.One */;
            }
        },
        // Greek
        el(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Catalan (ca)
        // German (de)
        // English (en)
        // Estonian (et)
        // Finnish (fi)
        // Italian (it)
        // Dutch (nl)
        // Swedish (sv)
        // Swahili (sw)
        // Urdu (ur)
        en(n) {
            if (n == 1 && Plural.getV(n) === 0) {
                return "one" /* Category.One */;
            }
        },
        // Spanish
        es(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Basque
        eu(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Persian
        fa(n) {
            if (n >= 0 && n <= 1) {
                return "one" /* Category.One */;
            }
        },
        // French
        fr(n) {
            if (n >= 0 && n < 2) {
                return "one" /* Category.One */;
            }
        },
        // Irish
        ga(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
            if (n == 2) {
                return "two" /* Category.Two */;
            }
            if (n == 3 || n == 4 || n == 5 || n == 6) {
                return "few" /* Category.Few */;
            }
            if (n == 7 || n == 8 || n == 9 || n == 10) {
                return "many" /* Category.Many */;
            }
        },
        // Gujarati
        gu(n) {
            if (n >= 0 && n <= 1) {
                return "one" /* Category.One */;
            }
        },
        // Hebrew
        he(n) {
            const v = Plural.getV(n);
            if (n == 1 && v === 0) {
                return "one" /* Category.One */;
            }
            if (n == 2 && v === 0) {
                return "two" /* Category.Two */;
            }
            if (n > 10 && v === 0 && n % 10 == 0) {
                return "many" /* Category.Many */;
            }
        },
        // Hindi
        hi(n) {
            if (n >= 0 && n <= 1) {
                return "one" /* Category.One */;
            }
        },
        // Croatian
        hr(n) {
            // same as Bosnian
            return Plural.bs(n);
        },
        // Hungarian
        hu(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Armenian
        hy(n) {
            if (n >= 0 && n < 2) {
                return "one" /* Category.One */;
            }
        },
        // Indonesian
        id(_n) {
            return undefined;
        },
        // Icelandic
        is(n) {
            const f = Plural.getF(n);
            if ((f === 0 && n % 10 === 1 && !(n % 100 === 11)) || !(f === 0)) {
                return "one" /* Category.One */;
            }
        },
        // Japanese
        ja(_n) {
            return undefined;
        },
        // Javanese
        jv(_n) {
            return undefined;
        },
        // Georgian
        ka(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Kazakh
        kk(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Khmer
        km(_n) {
            return undefined;
        },
        // Kannada
        kn(n) {
            if (n >= 0 && n <= 1) {
                return "one" /* Category.One */;
            }
        },
        // Korean
        ko(_n) {
            return undefined;
        },
        // Kurdish
        ku(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Kyrgyz
        ky(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Luxembourgish
        lb(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Lao
        lo(_n) {
            return undefined;
        },
        // Lithuanian
        lt(n) {
            const mod10 = n % 10;
            const mod100 = n % 100;
            if (mod10 == 1 && !(mod100 >= 11 && mod100 <= 19)) {
                return "one" /* Category.One */;
            }
            if (mod10 >= 2 && mod10 <= 9 && !(mod100 >= 11 && mod100 <= 19)) {
                return "few" /* Category.Few */;
            }
            if (Plural.getF(n) != 0) {
                return "many" /* Category.Many */;
            }
        },
        // Latvian
        lv(n) {
            const mod10 = n % 10;
            const mod100 = n % 100;
            const v = Plural.getV(n);
            const f = Plural.getF(n);
            const fMod10 = f % 10;
            const fMod100 = f % 100;
            if (mod10 == 0 || (mod100 >= 11 && mod100 <= 19) || (v == 2 && fMod100 >= 11 && fMod100 <= 19)) {
                return "zero" /* Category.Zero */;
            }
            if ((mod10 == 1 && mod100 != 11) || (v == 2 && fMod10 == 1 && fMod100 != 11) || (v != 2 && fMod10 == 1)) {
                return "one" /* Category.One */;
            }
        },
        // Macedonian
        mk(n) {
            return Plural.bs(n);
        },
        // Malayalam
        ml(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Mongolian
        mn(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Marathi
        mr(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Malay
        ms(_n) {
            return undefined;
        },
        // Maltese
        mt(n) {
            const mod100 = n % 100;
            if (n == 1) {
                return "one" /* Category.One */;
            }
            if (n == 0 || (mod100 >= 2 && mod100 <= 10)) {
                return "few" /* Category.Few */;
            }
            if (mod100 >= 11 && mod100 <= 19) {
                return "many" /* Category.Many */;
            }
        },
        // Burmese
        my(_n) {
            return undefined;
        },
        // Norwegian
        no(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Nepali
        ne(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Odia
        or(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Punjabi
        pa(n) {
            if (n == 1 || n == 0) {
                return "one" /* Category.One */;
            }
        },
        // Polish
        pl(n) {
            const v = Plural.getV(n);
            const mod10 = n % 10;
            const mod100 = n % 100;
            if (n == 1 && v == 0) {
                return "one" /* Category.One */;
            }
            if (v == 0 && mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
                return "few" /* Category.Few */;
            }
            if (v == 0 &&
                ((n != 1 && mod10 >= 0 && mod10 <= 1) || (mod10 >= 5 && mod10 <= 9) || (mod100 >= 12 && mod100 <= 14))) {
                return "many" /* Category.Many */;
            }
        },
        // Pashto
        ps(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Portuguese
        pt(n) {
            if (n >= 0 && n < 2) {
                return "one" /* Category.One */;
            }
        },
        // Romanian
        ro(n) {
            const v = Plural.getV(n);
            const mod100 = n % 100;
            if (n == 1 && v === 0) {
                return "one" /* Category.One */;
            }
            if (v != 0 || n == 0 || (mod100 >= 2 && mod100 <= 19)) {
                return "few" /* Category.Few */;
            }
        },
        // Russian
        ru(n) {
            const mod10 = n % 10;
            const mod100 = n % 100;
            if (Plural.getV(n) == 0) {
                if (mod10 == 1 && mod100 != 11) {
                    return "one" /* Category.One */;
                }
                if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
                    return "few" /* Category.Few */;
                }
                if (mod10 == 0 || (mod10 >= 5 && mod10 <= 9) || (mod100 >= 11 && mod100 <= 14)) {
                    return "many" /* Category.Many */;
                }
            }
        },
        // Sindhi
        sd(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Sinhala
        si(n) {
            if (n == 0 || n == 1 || (Math.floor(n) == 0 && Plural.getF(n) == 1)) {
                return "one" /* Category.One */;
            }
        },
        // Slovak
        sk(n) {
            // same as Czech
            return Plural.cs(n);
        },
        // Slovenian
        sl(n) {
            const v = Plural.getV(n);
            const mod100 = n % 100;
            if (v == 0 && mod100 == 1) {
                return "one" /* Category.One */;
            }
            if (v == 0 && mod100 == 2) {
                return "two" /* Category.Two */;
            }
            if ((v == 0 && (mod100 == 3 || mod100 == 4)) || v != 0) {
                return "few" /* Category.Few */;
            }
        },
        // Albanian
        sq(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Serbian
        sr(n) {
            // same as Bosnian
            return Plural.bs(n);
        },
        // Tamil
        ta(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Telugu
        te(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Tajik
        tg(_n) {
            return undefined;
        },
        // Thai
        th(_n) {
            return undefined;
        },
        // Turkmen
        tk(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Turkish
        tr(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Uyghur
        ug(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Ukrainian
        uk(n) {
            // same as Russian
            return Plural.ru(n);
        },
        // Uzbek
        uz(n) {
            if (n == 1) {
                return "one" /* Category.One */;
            }
        },
        // Vietnamese
        vi(_n) {
            return undefined;
        },
        // Chinese
        zh(_n) {
            return undefined;
        },
    };
    const Plural = {
        /**
         * Returns the plural category for the given value.
         */
        getCategory(value, languageCode) {
            if (!languageCode) {
                languageCode = document.documentElement.lang;
            }
            // Fallback: handle unknown languages as English
            if (typeof Plural[languageCode] !== "function") {
                languageCode = "en";
            }
            const category = Plural[languageCode](value);
            if (category) {
                return category;
            }
            return "other" /* Category.Other */;
        },
        /**
         * Returns the value for a `plural` element used in the template.
         *
         * @see    wcf\system\template\plugin\PluralFunctionTemplatePlugin::execute()
         */
        getCategoryFromTemplateParameters(parameters) {
            if (!parameters["value"]) {
                throw new Error("Missing parameter value");
            }
            if (!parameters["other"]) {
                throw new Error("Missing parameter other");
            }
            let value = parameters["value"];
            if (Array.isArray(value)) {
                value = value.length;
            }
            // handle numeric attributes
            const numericAttribute = Object.keys(parameters).find((key) => {
                return key.toString() === (~~key).toString() && key.toString() === value.toString();
            });
            if (numericAttribute) {
                return numericAttribute;
            }
            let category = Plural.getCategory(value);
            if (!parameters[category]) {
                category = "other" /* Category.Other */;
            }
            const string = parameters[category];
            if (string.indexOf("#") !== -1) {
                return string.replace("#", StringUtil.formatNumeric(value));
            }
            return string;
        },
        /**
         * `f` is the fractional number as a whole number (1.234 yields 234)
         */
        getF(n) {
            const tmp = n.toString();
            const pos = tmp.indexOf(".");
            if (pos === -1) {
                return 0;
            }
            return parseInt(tmp.substr(pos + 1), 10);
        },
        /**
         * `v` represents the number of digits of the fractional part (1.234 yields 3)
         */
        getV(n) {
            return n.toString().replace(/^[^.]*\.?/, "").length;
        },
        ...Languages,
    };
    return Plural;
});
