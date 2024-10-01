import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    USER = "user",
    SUPER_ADMIN = "super-admin",
}
registerEnumType(UserRole, { name: "UserRole", description: "User roles" });

@Entity()
@ObjectType()
export class User {
    @PrimaryGeneratedColumn("uuid")
    @Field((type) => ID, { description: "User ID" })
    id: string;

    @Column()
    @Field({ description: "Full name" })
    name: string;

    @Column()
    @Index({ unique: true })
    @Field({ description: "Email address" })
    email: string;

    @Column({ nullable: true, default: null })
    @Field({ nullable: true, defaultValue: null, description: "User image" })
    image: string | null;

    @Column()
    @Field({ description: "Password" })
    password: string;

    @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
    @Field((type) => UserRole, { description: "User role" })
    role: UserRole;

    @Column({ type: "boolean", default: false })
    @Field({ description: "Email verification status" })
    email_verified: boolean;

    @Column({ type: "boolean", default: false })
    @Field({ description: "Account disabled status" })
    account_disabled: boolean;

    @CreateDateColumn()
    @Field({ description: "User created date" })
    created_at: Date;

    @UpdateDateColumn()
    @Field({ description: "User updated date" })
    updated_at: Date;
}
