import { client } from "../apollo/client";
import { AuthService } from "./auth.service";

export const authService = new AuthService(client);