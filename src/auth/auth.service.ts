import bcryptjs from "bcryptjs";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";

import { MailService } from "src/mail/mail.service";
import { RegisterInput } from "./dto/register.input";
import { User } from "src/users/entities/user.entity";
import { TokenService } from "src/token/token.service";
import { TokenType } from "src/token/entities/token.entity";
import { EmailVerificationInput, RequestEmailVerificationInput } from "./dto/email-verification.input";
import { PasswordResetInput, RequestPasswordResetInput } from "./dto/password-reset.input";

@Injectable()
export class AuthService {
    constructor(
        private readonly mailService: MailService,
        private readonly tokenService: TokenService,
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) {}

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) throw new NotFoundException("User not found");

        const isPasswordMatching = await bcryptjs.compare(password, user.password);
        if (!isPasswordMatching) throw new HttpException("Invalid credentials", HttpStatus.UNAUTHORIZED);

        return user;
    }

    async register(registerInput: RegisterInput) {
        console.log("registerInput", registerInput);
        const existingUser = await this.usersRepository.findOne({ where: { email: registerInput.email } });
        if (existingUser) throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);

        const passwordHash = await bcryptjs.hash(registerInput.password, this.configService.get("CONFIGS.BCRYPT_SALT"));

        const context = {
            name: registerInput.name,
            password: passwordHash,
            email: registerInput.email,
        };

        const user = this.usersRepository.create(context);
        await this.usersRepository.save(user);

        const token = await this.tokenService.generateAuthTokens(user);

        await this.requestEmailVerification({ user_id: user.id });

        return { user, token };
    }

    async login(user: User) {
        const token = await this.tokenService.generateAuthTokens(user);
        return { user, token };
    }

    async requestEmailVerification(requestEmailVerificationInput: RequestEmailVerificationInput) {
        const user = await this.usersRepository.findOne({ where: { id: requestEmailVerificationInput.user_id } });
        if (!user) throw new NotFoundException("User not found");

        if (user.email_verified === true) throw new HttpException("Email already verified", HttpStatus.BAD_REQUEST);

        const verificationOtp = await this.tokenService.generateOtpToken({ user, tokenType: TokenType.EMAIL_VERIFICATION });

        await this.mailService.sendEmailVerificationEmail({ user, verificationToken: verificationOtp.code });

        return true;
    }

    async verifyEmail(emailVerificationInput: EmailVerificationInput) {
        const user = await this.usersRepository.findOne({ where: { id: emailVerificationInput.user_id } });
        if (!user) throw new NotFoundException("User not found");

        if (user.email_verified === true) throw new HttpException("Email already verified", HttpStatus.BAD_REQUEST);

        const isValidToken = await this.tokenService.verifyOtpToken({
            user,
            deleteIfValidated: true,
            tokenType: TokenType.EMAIL_VERIFICATION,
            code: emailVerificationInput.verification_otp,
            token: emailVerificationInput.verification_otp,
        });
        if (!isValidToken) throw new HttpException("Invalid or expired token", HttpStatus.UNAUTHORIZED);

        await this.usersRepository.update({ id: user.id }, { email_verified: true });

        return true;
    }

    async requestPasswordReset(requestResetPasswordInput: RequestPasswordResetInput) {
        const user = await this.usersRepository.findOne({ where: { email: requestResetPasswordInput.email } });
        if (!user) return { user_id: undefined };

        const resetToken = await this.tokenService.generateOtpToken({ user, tokenType: TokenType.PASSWORD_RESET });

        await this.mailService.sendPasswordResetEmail({ user, resetToken: resetToken.code });

        return { user_id: user.id };
    }

    async resetPassword(passwordResetInput: PasswordResetInput) {
        const user = await this.usersRepository.findOne({ where: { id: passwordResetInput.user_id } });
        if (!user) throw new NotFoundException("User not found");

        const isValidToken = await this.tokenService.verifyOtpToken({
            user,
            deleteIfValidated: true,
            code: passwordResetInput.reset_otp,
            token: passwordResetInput.reset_otp,
            tokenType: TokenType.PASSWORD_RESET,
        });
        if (!isValidToken) throw new HttpException("Invalid or expired token", HttpStatus.UNAUTHORIZED);

        const passwordHash = await bcryptjs.hash(passwordResetInput.new_password, this.configService.get("CONFIGS.BCRYPT_SALT"));
        await this.usersRepository.update({ id: user.id }, { password: passwordHash });

        return true;
    }
}
