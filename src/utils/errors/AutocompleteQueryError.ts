type ErrorType = 
| 'VALUE_REQUIRED'
| 'COORDINATES_NOT_WITHIN_BOUNDARY'
| 'LATLNG_NOT_PROVIDED'

export class AutocompleteQueryError extends Error {
    message: string = 'There was an error with the provided query'
    status: number = 400

    constructor(errorType: ErrorType){
        super()
        switch(errorType){
            case 'VALUE_REQUIRED':
                this.message = 'Value is a required parameter'
                break;
            case 'COORDINATES_NOT_WITHIN_BOUNDARY':
                this.message = 'The coordinates provided are not within the current dataset of North America'
                break;
            case 'LATLNG_NOT_PROVIDED':
                this.message = 'LatLng is required for this query'
                break;
        }
    }
}