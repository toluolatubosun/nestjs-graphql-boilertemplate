import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "./entities/user.entity";
import { AwsModule } from "src/aws/aws.module";
import { UsersService } from "./users.service";
import { UsersResolver } from "./users.resolver";

@Module({
    imports: [TypeOrmModule.forFeature([User]), AwsModule],
    providers: [UsersResolver, UsersService],
    exports: [UsersService],
})
export class UsersModule {}
