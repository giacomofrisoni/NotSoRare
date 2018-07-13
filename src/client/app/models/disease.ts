export class Disease {
    general: General;
    synonymous: Synonymous[];
    symptoms: Symptom[];
    treatments: Treatment[];
    diagnosis: Diagnosis[];
    complications: Complication[];
}

interface Synonymous {
    Name: string;
}

interface General {
    OrphaNumber: number;
    ICD10: string;
    OMIM: string;
    UMLS: string;
    MeSH: string;
    GARD: string;
    MedDRA: string;
    Incidence: string;
    ForumThreadsNumber: number;
    StandardUsersNumber: number;
    ModeratorsNumber: number;
    SpecialityName: string;
    Name: string;
    Description: string;
    Causes: string;
    CodDisease: number;
}

interface Symptom {
    CodSymptom: number;
    Name: string;
    Description: string;
}

interface CollateralEffect {
    CodTreatment: number;
    CodCollateralEffect: number;
    Description: string;
}

interface Treatment {
    CodTreatment: number;
    Name: string;
    Description: string;
    Type: string;
    collateralEffects: CollateralEffect[];
}

interface Diagnosis {
    CodDiagnosis: number;
    Name: string;
    Description: string;
}

interface Complication {
    CodComplication: number;
    Description: string;
}