import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: {
    content: undefined,
    localModel: {},
    id: ''
  },

};

export const notesSlice = createSlice({
  name: 'notes',

  initialState,
  reducers: {
    setModel: (state, action) => {
      state.value.localModel = action.payload
    },
    setId: (state, action) => {
      state.value.id = action.payload
    },
    load: (state, action) => {
      state.value.id = action.payload.id,
      state.value.content = action.payload.content,
      state.value.localModel = action.payload.model
      state.value.lastModified = action.payload.lastModified
    }
  },
});

export const { setModel, setId, load } = notesSlice.actions;
export default notesSlice.reducer;