export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: number;
    age: number;
    weight: number;
    stepGoal: number;
    pomes: number; // currency
    proiflePicture: string; // base 64
}

/**
 * a user. ye
 * has attribute step goal (most recent/updated step goal)
 * and other attributes (self-explannatory)
 */