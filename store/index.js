import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'
import { combineReducers } from 'redux'
import authReducer from './slices/authSlice'
import notificationsReducer from './slices/notificationsSlice'

const createNoopStorage = () => ({
  getItem(_key) {
    return Promise.resolve(null)
  },
  setItem(_key, value) {
    return Promise.resolve(value)
  },
  removeItem(_key) {
    return Promise.resolve()
  },
})

const storage =
  typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage()

/** New persist key so old Redux slices are not rehydrated. */
const persistConfig = {
  key: 'root-edulamad-v1',
  storage,
  whitelist: ['auth'],
}

const rootReducer = combineReducers({
  auth: authReducer,
  notifications: notificationsReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
      immutableCheck: {
        ignoredPaths: ['notifications'],
      },
    }),
})

export const persistor = persistStore(store)
