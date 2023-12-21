export enum TransactionTypeEnum {
    PAYMENT = 'Payment',
    REFUND = 'Refund'
}

export interface CreateTransactionDTO {
    userId: number,
    orderId: number,
    transactionType: TransactionTypeEnum,
    amount: number,
}
