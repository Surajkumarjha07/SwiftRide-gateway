type UserPayload = {
    userEmail: string,
    userName: string,
    userId: string,
    role: string
}

type CaptainPayload = {
    captainEmail: string,
    captainName: string,
    captainId: string,
    role: string,
    isVehicleVerified: string
}

export type { UserPayload, CaptainPayload };