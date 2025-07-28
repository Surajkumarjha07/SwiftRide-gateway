type UserPayload = {
    userEmail: string,
    userName: string,
    userId: string,
    role: string
}

type CaptainPayload = {
    captainId: string,
    captainName: string,
    captainEmail: string,
    role: string,
    vehicleType: string,
    vehicleNo: string,
    isVehicleVerified: string
}

export type { UserPayload, CaptainPayload };