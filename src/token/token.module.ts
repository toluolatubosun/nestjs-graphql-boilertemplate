import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TokenService } from "./token.service";
import { Token } from "./entities/token.entity";
import { TokenResolver } from "./token.resolver";

@Module({
    imports: [JwtModule.register({}), TypeOrmModule.forFeature([Token])],
    providers: [TokenResolver, TokenService],
    exports: [TokenService],
})
export class TokenModule {}
