import "./sentry";

import * as Sentry from "@sentry/node";
import { json, urlencoded } from "express";
import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { SentryExceptionFilter } from "./common/filters/sentry-exception.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const { httpAdapter } = app.get(HttpAdapterHost);
    Sentry.setupNestErrorHandler(app, new SentryExceptionFilter(httpAdapter));

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Increase payload size limit
    app.use(json({ limit: "50mb" }));
    app.use(urlencoded({ limit: "50mb", extended: true }));

    await app.listen(process.env.PORT || 4000);
}
bootstrap();
