import { Field, ObjectType } from "@nestjs/graphql";

import { User } from "../entities/user.entity";
import { PaginationResponse } from "src/common/dto/pagination.dto";

@ObjectType({ description: "Get all users response" })
export class UserGetAllResponse {
    @Field(() => [User], { description: "Users" })
    users: User[];

    @Field(() => PaginationResponse, { description: "Pagination" })
    pagination: PaginationResponse;
}
