import '../styles/globals.css';
import Head from 'next/head';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { AuthContextProvider } from "../context/AuthContext";

import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import notes from '../reducers/notes'; 


const store = configureStore({
  reducer: { notes },
});

const queryClient = new QueryClient()

function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthContextProvider>
          <Head>
            <title>WordWarden</title>
          </Head>
          <Component {...pageProps} />
        </AuthContextProvider>
      </Provider>
    </QueryClientProvider>
    
  );
}

export default App;
