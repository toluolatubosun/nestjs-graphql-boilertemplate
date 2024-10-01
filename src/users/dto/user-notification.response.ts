import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType({ description: "User notification response" })
export class UserNotification {
    @Field({ description: "Notification title" })
    title: string;

    @Field({ description: "Notification body" })
    body: string;
}
