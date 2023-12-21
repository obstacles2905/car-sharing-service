import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";
import "reflect-metadata";

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: "varchar", nullable: true})
    firstName: string;

    @Column({type: "varchar", nullable: true})
    lastName: string;

    @Column({type: "varchar"})
    email: string;

    @Column("varchar")
    login: string;

    @Column("varchar")
    password: string;

    @Column({type: "varchar", nullable: true})
    phoneNumber: string;

    @Column({type: "varchar", nullable: true})
    address: string;

    @Column({type: "varchar", nullable: true})
    driverLicenseNumber: string;

    @Column({type: "timestamptz", nullable: true})
    registrationDate: Date;

    @Column({type: "boolean", nullable: true})
    isActive: boolean;

    @Column({type: "numeric", default: 0})
    balance: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
