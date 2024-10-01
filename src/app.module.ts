import { join } from "path";
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { RedisClientOptions } from "redis";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from "@apollo/server/plugin/landingPage/default";

import { AppService } from "./app.service";
import { AwsModule } from "./aws/aws.module";
import { MailModule } from "./mail/mail.module";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { TokenModule } from "./token/token.module";
import { UsersModule } from "./users/users.module";
import { TokenService } from "./token/token.service";
import { UsersService } from "./users/users.service";
import { CommonModule } from "./common/common.module";
import { DatabaseModule } from "./database/database.module";
import configuration, { DEPLOYMENT_ENV, CONFIGS } from "../configs";

const pubSub = new RedisPubSub({ connection: CONFIGS.REDIS_URI });

@Module({
    imports: [
        SentryModule.forRoot(),
        GraphQLModule.forRootAsync<ApolloDriverConfig>({
            imports: [TokenModule, UsersModule],
            inject: [TokenService, UsersService],
            driver: ApolloDriver,
            useFactory: (tokenService: TokenService, userService: UsersService) => ({
                sortSchema: true,
                playground: false,
                introspection: DEPLOYMENT_ENV !== "production",
                context: ({ req, res }) => ({ req, res, pubSub }),
                autoSchemaFile: join(process.cwd(), "src/schema.gql"),
                plugins: [DEPLOYMENT_ENV === "production" ? ApolloServerPluginLandingPageProductionDefault() : ApolloServerPluginLandingPageLocalDefault()],
                subscriptions: {
                    "graphql-ws": {
                        onConnect: async (context) => {
                            const { connectionParams } = context;
                            const authentication: string | null = (connectionParams.authorization || connectionParams.Authorization) as string;
                            const JWTToken = authentication?.split(" ")[1];

                            if (JWTToken) {
                                const payload = tokenService.decodeJWTToken(JWTToken);
                                const user = await userService.getById(payload.sub);
                                console.log("User connected", user);
                            }
                        },
                        onDisconnect: async (context) => {
                            const { connectionParams } = context;
                            const authentication: string | null = (connectionParams.authorization || connectionParams.Authorization) as string;
                            const JWTToken = authentication?.split(" ")[1];

                            if (JWTToken) {
                                const payload = tokenService.decodeJWTToken(JWTToken);
                                const user = await userService.getById(payload.sub);
                                console.log("User disconnected", user);
                            }
                        },
                    },
                },
            }),
        }),
        ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
        CacheModule.register<RedisClientOptions>({ isGlobal: true, store: redisStore, url: CONFIGS.REDIS_URI }),
        AwsModule,
        MailModule,
        AuthModule,
        UsersModule,
        TokenModule,
        CommonModule,
        DatabaseModule,
    ],
    controllers: [AppController],
    providers: [{ provide: APP_FILTER, useClass: SentryGlobalFilter }, { provide: "PUB_SUB", useValue: pubSub }, AppService],
})
export class AppModule {}
