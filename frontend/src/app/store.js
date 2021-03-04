import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from '../features/navigation/navigationSlice';
import pipelineReducer from '../features/pipeline/pipelineSlice';

export default configureStore({
  reducer: {
    navigation: navigationReducer,
    pipeline: pipelineReducer
  },
});