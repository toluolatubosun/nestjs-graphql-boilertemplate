import crypto from "crypto";
import * as Sentry from "@sentry/node";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SESClient } from "@aws-sdk/client-ses";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand, GetObjectCommand, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

@Injectable()
export class AwsService {
    s3Client: S3Client;
    sesClient: SESClient;

    constructor(private readonly configService: ConfigService) {
        this.sesClient = new SESClient({
            region: "us-east-1", // TODO: replace with the appropriate region
            credentials: {
                accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
                secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
            },
        });

        this.s3Client = new S3Client({
            region: "us-east-1", // TODO: replace with the appropriate region
            credentials: {
                accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
                secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
            },
        });
    }

    async uploadFileToS3({ s3Bucket, base64File, folder, fileName, ACL = "private" }: { s3Bucket: string; base64File: string; folder: string; fileName?: string; ACL?: ObjectCannedACL }) {
        const finalFileName = fileName ? fileName : `${crypto.randomBytes(30).toString("hex")}`;

        const buffer = Buffer.from(base64File.replace(/^data:.+\/\w+;base64,/, ""), "base64");
        const params = {
            Body: buffer,
            Bucket: s3Bucket,
            ContentEncoding: "base64",
            ACL: ACL as ObjectCannedACL,
            ContentType: base64File.split(";")[0].split(":")[1],
            Key: `${this.configService.get("DEPLOYMENT_ENV")}/${folder}/${finalFileName}`,
        };

        try {
            const command = new PutObjectCommand(params);
            await this.s3Client.send(command);

            return `https://${s3Bucket}.s3.amazonaws.com/${params.Key}`;
        } catch (error) {
            Sentry.captureException(new Error("From Third-Party: fn (uploadFileToS3)"), { extra: { params, response: error }, level: "error" });
            return null;
        }
    }

    async deleteFileFromS3({ s3Bucket, Location }: { s3Bucket: string; Location: string | null }) {
        if (!Location || !Location.includes(s3Bucket)) return;

        const params = {
            Bucket: s3Bucket,
            Key: Location.split("amazonaws.com/").pop() as string,
        };

        try {
            await this.s3Client.send(new DeleteObjectCommand(params));

            return true;
        } catch (error: any) {
            Sentry.captureException(new Error("From Third-Party: fn (deleteFileFromS3)"), { extra: { params, response: error }, level: "error" });
            return false;
        }
    }

    async getSignedUrlFromS3({ s3Bucket, Location, Expires = 60 * 60 * 24 }: { s3Bucket: string; Location: string; Expires?: number }) {
        if (!Location.includes(s3Bucket)) return null;

        const params = {
            Bucket: s3Bucket,
            Key: Location.split("amazonaws.com/").pop(),
        };

        try {
            const signedUrl = await getSignedUrl(this.s3Client, new GetObjectCommand(params), { expiresIn: Expires });

            return signedUrl;
        } catch (error: any) {
            Sentry.captureException(new Error("From Third-Party: fn (getSignedUrlFromS3)"), { extra: { params, response: error }, level: "error" });
            return null;
        }
    }
}
