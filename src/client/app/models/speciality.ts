

export class Speciality {
    CodSpecialty: number;
    SpecialtyName: string;
    diseases: Disease[];
}

interface Disease {
    CodDisease: number;
    DiseaseName: string;
}