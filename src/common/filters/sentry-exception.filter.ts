import * as Sentry from "@sentry/node";

import { GqlContextType } from "@nestjs/graphql";
import { BaseExceptionFilter } from "@nestjs/core";
import { ArgumentsHost, Catch } from "@nestjs/common";
import { ExternalExceptionFilter } from "@nestjs/core/exceptions/external-exception-filter";

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        Sentry.captureException(exception);
        if (host.getType<GqlContextType>() === "graphql") {
            new ExternalExceptionFilter().catch(exception, host);
        } else {
            super.catch(exception, host);
        }
    }
}
