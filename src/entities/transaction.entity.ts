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
import { OrderEntity } from "./order.entity";
import "reflect-metadata";

@Entity({name: 'transactions'})
export class TransactionEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity)
    @JoinColumn({name: 'userId'})
    user: UserEntity;

    @Column("numeric")
    userId: number;

    @ManyToOne(() => OrderEntity)
    @JoinColumn({name: 'orderId'})
    order: OrderEntity

    @Column("numeric")
    orderId: number;

    @Column("varchar")
    transactionType: string;

    @Column({type: "float"})
    amount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
