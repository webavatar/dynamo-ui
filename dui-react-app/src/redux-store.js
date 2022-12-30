import { createStore } from 'redux'
import rootReducer from './redux-reducer'

const store = createStore(rootReducer)

export default store