import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType({ description: "Request password reset response" })
export class RequestPasswordResetResponse {
    @Field({ description: "User ID", nullable: true })
    user_id?: string;
}
