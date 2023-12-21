import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
} from "typeorm";
import { UserEntity } from "./user.entity";
import { CarEntity } from "./car.entity";
import "reflect-metadata";

@Entity({name: 'orders'})
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity)
    user: UserEntity;

    @Column("numeric")
    userId: number;

    @ManyToOne(() => CarEntity)
    @JoinColumn({name: 'carId'})
    car: CarEntity;

    @Column("numeric")
    carId: number;

    @Column({type: "timestamptz", nullable: true})
    startTime: Date;

    @Column({type: "timestamptz", nullable: true})
    endTime: Date;

    @Column({type: "float"})
    cost: number;

    @Column("varchar")
    status: string;

    @Column({type: "varchar", nullable: true})
    pickupLocation: string;

    @Column({type: "varchar", nullable: true})
    dropOffLocation: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
