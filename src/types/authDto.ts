export interface RegisterUserDTO {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}
export interface LoginUserDTO {
  email: string;
  password: string;
}