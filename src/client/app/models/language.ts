export class Language {
    code2Letters: string;
    code3Letters: string;
    englishName: string;
    translatedName: string;
    icon: string;

    // Default constructor for a language
    constructor(code2Letters: string, code3Letters: string, englishName: string, translatedName: string) {
        this.code2Letters = code2Letters;
        this.code3Letters = code3Letters;
        this.englishName = englishName;
        this.translatedName = translatedName;
        this.icon = '../../assets/countries/flags/' + this.code3Letters.toLowerCase() + '.svg';
    }

    // If I have a JSON object, I can convert it trough this static method
    static convertJsonToLanguage(jsonObj: any) {
        var translatedName = null;
        for (var prop in jsonObj.name.native) {
            if (prop == jsonObj.cca3.toLowerCase()) {
                translatedName = jsonObj.name.native[prop].common;
            }
        }
        
        return new Language(
            jsonObj.cca2.toUpperCase(),
            jsonObj.cca3.toUpperCase(),
            jsonObj.name.common,
            translatedName
        );
    }
}
