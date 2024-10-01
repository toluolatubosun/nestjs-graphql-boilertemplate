import { UseGuards } from "@nestjs/common";
import { PubSub, withFilter } from "graphql-subscriptions";
import { Query, Context, Resolver, Mutation, Args, Subscription } from "@nestjs/graphql";

import { CONFIGS } from "../../configs";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { UpdateUserInput } from "./dto/update-user.input";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { JWTRoleGuard } from "src/auth/guards/jwt-role.guard";
import { PaginationInput } from "src/common/dto/pagination.dto";
import { UserGetAllResponse } from "./dto/user-get-all.response";
import RequestWithUser from "src/auth/interfaces/request-with-user";
import { UserNotification } from "./dto/user-notification.response";

@Resolver((of) => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Query(() => User)
    @UseGuards(JwtAuthGuard)
    async userGetMe(@Context("req") req: RequestWithUser) {
        return req.user;
    }

    @Mutation(() => User)
    @UseGuards(JWTRoleGuard(CONFIGS.APP_ROLES.USER))
    async userUpdateMe(@Context("req") req: RequestWithUser, @Args("updateUserInput") updateUserInput: UpdateUserInput) {
        return this.usersService.updateUserProfile(req.user, updateUserInput);
    }

    @Query(() => UserGetAllResponse)
    @UseGuards(JWTRoleGuard(CONFIGS.ADMIN_ROLES.SUPER_ADMIN))
    async userGetAll(@Args("paginationInput") paginationInput: PaginationInput) {
        return this.usersService.getAllUsers(paginationInput);
    }

    @Mutation(() => Boolean)
    @UseGuards(JWTRoleGuard(CONFIGS.APP_ROLES.USER))
    async userDemoNotification(@Context("req") req: RequestWithUser, @Context("pubSub") pubSub: PubSub): Promise<boolean> {
        await pubSub.publish("USER_NOTIFICATION", {
            receiverIds: [req.user.id],
            userNotification: { title: "This is a demo notification", body: "This is a demo notification body. Hello world!" },
        });

        return true;
    }

    @Subscription(() => UserNotification)
    @UseGuards(JWTRoleGuard(CONFIGS.APP_ROLES.USER))
    async userNotification(@Context("pubSub") pubSub: PubSub, @Context("req") req: RequestWithUser) {
        return withFilter(
            () => pubSub.asyncIterator("USER_NOTIFICATION"),
            ({ receiverIds }: { receiverIds: string[] }, { userId }: { userId: string }) => {
                return receiverIds.includes(userId);
            }
        )(null, { userId: req.user.id });
    }
}
