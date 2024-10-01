import { Field, InputType } from "@nestjs/graphql";

@InputType({ description: "Update user input" })
export class UpdateUserInput {
    @Field({ nullable: true, description: "User's name" })
    name?: string;

    @Field({ nullable: true, description: "User's profile image in base64" })
    image?: string;
}
