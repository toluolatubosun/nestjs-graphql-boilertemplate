import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType({ description: "Request email verification input" })
export class RequestEmailVerificationInput {
    @IsString()
    @Field({ description: "User ID" })
    user_id: string;
}

@InputType({ description: "Email verification input" })
export class EmailVerificationInput {
    @IsString()
    @Field({ description: "Verification OTP" })
    verification_otp: string;

    @IsString()
    @Field({ description: "User ID" })
    user_id: string;
}
