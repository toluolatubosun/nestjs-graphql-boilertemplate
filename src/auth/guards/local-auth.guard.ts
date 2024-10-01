import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
    constructor() {
        super();
    }

    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;

        const { loginInput } = ctx.getArgs();
        req.body = loginInput;

        return req;
    }
}
