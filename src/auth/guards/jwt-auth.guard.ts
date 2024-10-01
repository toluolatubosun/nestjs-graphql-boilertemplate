import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;

        // If the request is from a Subscription, headers are not set by default.
        // We need to set them manually, otherwise the JWT strategy will not work.
        if (req.connectionParams) {
            req.headers = {
                authorization: req.connectionParams.authorization || req.connectionParams.Authorization,
            };
        }

        return req;
    }
}
