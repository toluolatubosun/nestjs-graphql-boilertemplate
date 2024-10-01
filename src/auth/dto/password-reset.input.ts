import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsString } from "class-validator";

@InputType({ description: "Reset password input" })
export class PasswordResetInput {
    @IsString()
    @Field({ description: "User ID" })
    user_id: string;

    @IsString()
    @Field({ description: "New password" })
    new_password: string;

    @IsString()
    @Field({ description: "Reset OTP" })
    reset_otp: string;
}

@InputType({ description: "Request password reset input" })
export class RequestPasswordResetInput {
    @IsEmail()
    @Field({ description: "Email" })
    email: string;
}
