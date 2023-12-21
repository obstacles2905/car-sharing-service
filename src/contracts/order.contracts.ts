
export enum OrderStatusEnum {
    UNPAID = 'Unpaid',
    ACTIVE = 'Active',
    FINISHED = 'Finished',
    REFUNDED = 'Refunded'
}


export interface CreateOrderDTO {
    userId: number,
    carId: number,
    startTime: string,
    endTime: string,
    cost: number,
    status: OrderStatusEnum,
    pickupLocation: string,
    dropOffLocation?: string
}
