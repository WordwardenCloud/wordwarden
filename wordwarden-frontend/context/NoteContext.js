import React, { createContext, useContext, useState, useEffect } from 'react';

const NoteContext = createContext();
export const useNote = () => useContext(NoteContext);

const isBrowser = typeof window !== 'undefined';

const getItem = (key) => {
    if (!isBrowser) return key === 'localModel' ? {} : ''; // Return default values when not in browser
    const item = localStorage.getItem(key);
    if (item === null) return key === 'localModel' ? {} : ''; // Provide default values if the key does not exist
    try {
        return JSON.parse(item);
    } catch (e) {
        console.error("Error parsing JSON from localStorage", e);
        return key === 'localModel' ? {} : ''; // Provide default values in case of parsing error
    }
};


const setItem = (key, value) => {
    if (isBrowser) localStorage.setItem(key, JSON.stringify(value));
};

export const NoteProvider = ({ children }) => {
    const [noteId, setNoteId] = useState(() => isBrowser ? getItem('noteId') : '');
    const [localModel, setLocalModel] = useState(() => isBrowser ? getItem('localModel') : {});

    useEffect(() => {
        if (isBrowser) {
            setItem('noteId', noteId);
            setItem('localModel', localModel);
        }
    }, [noteId, localModel]);

    return (
        <NoteContext.Provider value={{ noteId, setNoteId, localModel, setLocalModel }}>
            {children}
        </NoteContext.Provider>
    );
};
