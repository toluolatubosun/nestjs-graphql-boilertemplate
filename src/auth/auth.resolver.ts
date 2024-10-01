import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Resolver } from "@nestjs/graphql";

import { AuthService } from "./auth.service";
import { LoginInput } from "./dto/login.input";
import { RegisterInput } from "./dto/register.input";
import { TokenService } from "src/token/token.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import RequestWithUser from "./interfaces/request-with-user";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { AuthResponse, AuthToken } from "./dto/auth.response";
import { RequestPasswordResetResponse } from "./dto/password-reset.response";
import { RequestWithUserAndToken } from "src/common/interfaces/request.interface";
import { PasswordResetInput, RequestPasswordResetInput } from "./dto/password-reset.input";
import { EmailVerificationInput, RequestEmailVerificationInput } from "./dto/email-verification.input";

@Resolver()
export class AuthResolver {
    constructor(
        private readonly authService: AuthService,
        private readonly tokenService: TokenService
    ) {}

    @Mutation(() => AuthResponse)
    @UseGuards(LocalAuthGuard)
    async authLogin(@Args("loginInput") _loginInput: LoginInput, @Context("req") req: RequestWithUser): Promise<AuthResponse> {
        return this.authService.login(req.user);
    }

    @Mutation(() => AuthResponse)
    async authRegister(@Args("registerInput") registerInput: RegisterInput): Promise<AuthResponse> {
        return this.authService.register(registerInput);
    }

    @Mutation(() => AuthToken, { description: "Refresh authentication tokens" })
    @UseGuards(JwtRefreshGuard)
    async authRefreshToken(@Args("refreshToken") _refreshToken: string, @Context("req") req: RequestWithUserAndToken): Promise<AuthToken> {
        return this.tokenService.refreshAuthTokens(req.user.user, req.user.token);
    }

    @Mutation(() => Boolean, { description: "Logout user" })
    @UseGuards(JwtRefreshGuard)
    async authLogout(@Args("refreshToken") _refreshToken: string, @Context("req") req: RequestWithUserAndToken): Promise<boolean> {
        return this.tokenService.revokeRefreshToken(req.user.user, req.user.token);
    }

    @Mutation(() => Boolean, { description: "Verify email" })
    async authVerifyEmail(@Args("emailVerificationInput") emailVerificationInput: EmailVerificationInput): Promise<boolean> {
        return this.authService.verifyEmail(emailVerificationInput);
    }

    @Mutation(() => Boolean, { description: "Request email verification" })
    async authRequestEmailVerification(@Args("requestEmailVerificationInput") requestEmailVerificationInput: RequestEmailVerificationInput): Promise<boolean> {
        return this.authService.requestEmailVerification(requestEmailVerificationInput);
    }

    @Mutation(() => Boolean, { description: "Reset password" })
    async authResetPassword(@Args("passwordResetInput") passwordResetInput: PasswordResetInput): Promise<boolean> {
        return this.authService.resetPassword(passwordResetInput);
    }

    @Mutation(() => RequestPasswordResetResponse, { description: "Request password reset" })
    async authRequestPasswordReset(@Args("requestPasswordResetInput") requestPasswordResetInput: RequestPasswordResetInput): Promise<RequestPasswordResetResponse> {
        return this.authService.requestPasswordReset(requestPasswordResetInput);
    }
}
