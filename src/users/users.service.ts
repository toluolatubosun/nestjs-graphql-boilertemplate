import { Repository } from "typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";

import { User } from "./entities/user.entity";
import { AwsService } from "src/aws/aws.service";
import { UpdateUserInput } from "./dto/update-user.input";
import { PaginationInput, PaginationResponse } from "src/common/dto/pagination.dto";

@Injectable()
export class UsersService {
    constructor(
        private readonly awsService: AwsService,
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) {}

    async getById(id: string): Promise<User | null> {
        const user = await this.usersRepository.findOne({ where: { id } });
        return user;
    }

    async updateUserProfile(user: User, updateUserInput: UpdateUserInput): Promise<User> {
        const foundUser = await this.usersRepository.findOne({ where: { id: user.id } });
        if (!foundUser) throw new NotFoundException("User not found");

        const dataToUpdate: Record<string, any> = {
            name: updateUserInput.name,
        };

        if (updateUserInput.image) {
            // Upload the file to S3
            const image = await this.awsService.uploadFileToS3({
                folder: "users",
                ACL: "public-read",
                base64File: updateUserInput.image,
                s3Bucket: this.configService.get("CONFIGS.AWS.S3_BUCKET"),
            });
            if (image) dataToUpdate.image = image;

            // Delete the old file from S3
            if (foundUser.image) {
                await this.awsService.deleteFileFromS3({ s3Bucket: this.configService.get("CONFIGS.AWS.S3_BUCKET"), Location: foundUser.image });
            }
        }

        return await this.usersRepository.save({ ...foundUser, ...dataToUpdate });
    }

    async getAllUsers(paginationInput: PaginationInput) {
        const users = await this.usersRepository.find({
            take: paginationInput.limit,
            skip: (paginationInput.page - 1) * paginationInput.limit,
        });

        const total = await this.usersRepository.count();

        const pagination: PaginationResponse = {
            total_docs: total,
            page: paginationInput.page,
            limit: paginationInput.limit,
            total_pages: Math.ceil(total / paginationInput.limit),
        };

        return { users, pagination };
    }
}
