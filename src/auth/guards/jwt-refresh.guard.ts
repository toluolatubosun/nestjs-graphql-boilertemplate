import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class JwtRefreshGuard extends AuthGuard("jwt-refresh") {
    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;

        const { refreshToken } = ctx.getArgs();
        req.body = { refreshToken };

        return req;
    }
}
