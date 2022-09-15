export interface JobInfo {
    playerEntityId: number,
    vehicleInfo: JobVehicleInfo,
    waypointId: number,
    isWorking: boolean
}

export interface JobVehicleInfo {
    vehicleEntityId: number,
    isWorking: boolean,
    metadata: {
        [metadataId: string]: any
    }
}