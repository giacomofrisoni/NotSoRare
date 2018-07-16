function getRareDiseasesNameViewFromLanguage(codLanguage) {
    var viewName;
    switch (codLanguage) {
        case "it": viewName = "RareDiseaseNameITAView"; break;
        case "en": viewName = "RareDiseaseNameENGView"; break;
        case "pl": viewName = "RareDiseaseNamePOLView"; break;
        default: viewName = "RareDiseaseNameENGView"; break;
    }
    return viewName;
}

function getRareDiseasesSynonymousNameViewFromLanguage(codLanguage) {
    var viewName;
    switch (codLanguage) {
        case "it": viewName = "RareDiseaseSynonymousNameITAView"; break;
        case "en": viewName = "RareDiseaseSynonymousNameENGView"; break;
        case "pl": viewName = "RareDiseaseSynonymousNamePOLView"; break;
        default: viewName = "RareDiseaseSynonymousNameENGView"; break;
    }
    return viewName;
}

module.exports = {
    getRareDiseasesNameViewFromLanguage,
    getRareDiseasesSynonymousNameViewFromLanguage
};