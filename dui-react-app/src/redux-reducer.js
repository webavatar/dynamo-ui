const initialState = {
    tables: []
}

// Use the initialState as a default value
export default function rootReducer(state = initialState, action) {
    // The reducer normally looks at the action type field to decide what happens

    //console.log('Calling reducer', action)
    switch (action.type) {

        case 'tables':
            return {
                ...state,
                tables: action.payload
            }
        default:
            // If this reducer doesn't recognize the action type, or doesn't
            // care about this specific action, return the existing state unchanged
            return state
    }
}