import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";

@ObjectType({ description: "User authentication token" })
export class AuthToken {
    @Field(() => String, { description: "Access token" })
    access_token: string;

    @Field(() => String, { description: "Refresh token" })
    refresh_token: string;
}

@ObjectType({ description: "User authentication response" })
export class AuthResponse {
    @Field(() => User, { description: "User data" })
    user: User;

    @Field(() => AuthToken, { description: "Authentication tokens" })
    token: AuthToken;
}
