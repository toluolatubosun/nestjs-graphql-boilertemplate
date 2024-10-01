import { Field, InputType } from "@nestjs/graphql";
import { IsAlphanumeric, IsEmail, IsString } from "class-validator";

@InputType({ description: "User registration input" })
export class RegisterInput {
    @IsString()
    @Field({ description: "User full name" })
    name: string;

    @IsEmail()
    @Field({ description: "User email address" })
    email: string;

    @IsAlphanumeric()
    @Field({ description: "User password" })
    password: string;
}
