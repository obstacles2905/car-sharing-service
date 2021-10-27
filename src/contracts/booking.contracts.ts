export interface IGetBookingsRequest {
    amenityId: number;
    timestamp: string;
}

export interface IGetBookingsResponse {
    id: number;
    "user_id": number;
    "amenity_name": string;
    "start_time": number;
    "end_time": number;
    "date"?: number;
}

export interface IGetBookingsResponseTransformed {
    bookingId: number;
    userId: number;
    startTime: string;
    duration: string;
    amenityName: string;
}

export interface IPostBookingRequest {
    userId: number;
    amenityId: number;
    startTime: number;
    endTime: number;
    timestamp: number;
}