import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from "typeorm";
import "reflect-metadata";

export enum CarStatusEnum {
    AVAILABLE = "Available",
    IN_USAGE = "In usage",
    REPAIRING = "Repairing",
    BOOKED = "Booked",
}

@Entity({ name: 'cars' })
export class CarEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar'})
    brand: string;

    @Column({type: 'varchar'})
    model: string;

    @Column({type: 'numeric'})
    year: number;

    @Column({type: 'varchar'})
    registrationNumber: string;

    @Column({type: 'varchar'})
    color: string;

    @Column({type: 'varchar'})
    fuelType: string;

    @Column({type: 'numeric'})
    mileage: number;

    @Column({type: 'varchar'})
    condition: string;

    @Column({type: 'float'})
    latitude: number;

    @Column("float")
    longitude: number;

    @Column("varchar")
    photoUrl: string;

    @Column({type: 'varchar'})
    status: CarStatusEnum;

    @Column({type: 'numeric'})
    rentPrice: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
