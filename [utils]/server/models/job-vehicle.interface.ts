export interface JobInfo {
    playerEntityId: number,
    vehicleInfo: JobVehicleInfo,
    waypointId: number
}

export interface JobVehicleInfo {
    vehicleEntityId: number,
    metadata: {
        [metadataId: string]: any
    }
}