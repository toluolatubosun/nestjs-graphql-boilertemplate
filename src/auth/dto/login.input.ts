import { Field, InputType } from "@nestjs/graphql";
import { IsAlphanumeric, IsEmail } from "class-validator";

@InputType({ description: "User login input" })
export class LoginInput {
    @IsEmail()
    @Field(() => String, { description: "User email" })
    email: string;

    @IsAlphanumeric()
    @Field(() => String, { description: "User password" })
    password: string;
}
