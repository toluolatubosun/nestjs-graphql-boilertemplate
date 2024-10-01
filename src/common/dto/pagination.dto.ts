import { Field, InputType, ObjectType } from "@nestjs/graphql";

@InputType({ description: "Pagination input" })
export class PaginationInput {
    @Field({ description: "Page number", defaultValue: 1 })
    page: number;

    @Field({ description: "Limit per page", defaultValue: 10 })
    limit: number;
}

@ObjectType({ description: "Pagination response" })
export class PaginationResponse {
    @Field({ description: "Page number" })
    page: number;

    @Field({ description: "Limit per page" })
    limit: number;

    @Field({ description: "Total pages" })
    total_pages: number;

    @Field({ description: "Total documents" })
    total_docs: number;
}
