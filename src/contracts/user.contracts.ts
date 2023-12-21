export interface IRegisterRequest {
    email: string;
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
