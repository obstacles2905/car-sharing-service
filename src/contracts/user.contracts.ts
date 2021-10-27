export interface IRegisterRequest {
    name: string;
    login: string;
    password: string;
}

export interface ILoginRequest {
    login: string;
    password: string;
}

export interface ILoginResponse {
    id: number;
    name: string;
    login: string;
    salt: string;
}