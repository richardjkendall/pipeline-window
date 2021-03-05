import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from "axios";

export const fetchAll = createAsyncThunk(
  'pipeline/fetchAll',
  async (thunkAPI) => {
    const response = await axios.get("/api/pipeline");
    console.log("got following response", response.data);
    var pipelines = [];
    response.data.forEach(element => {
      var pipeline = element;
      console.log("working on element", element);
      pipelines.push(pipeline);
    });
    return pipelines;
  }
)

export const getLogs = createAsyncThunk(
  'pipeline/getLogs',
  async (item, thunkAPI) => {
    const response = await axios.get("/api/codebuild/" + item);
    return response.data.events;
  }
)

const pipelineSlice = createSlice({
  name: 'pipeline',
  initialState: { 
    pipelines: [], 
    logs: [],
    selectedPipeline: {},
    loading: 'idle', 
    error: '',
    order: 'asc',
    orderBy: 'name',
    selected: [],
    page: 0,
    rowsPerPage: 10,
    formOpen: false,
    logsOpen: false,
    codeBuildProject: ""
  },
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
    setOrder: (state, action) => {
      state.order = action.payload;
    },
    setOrderBy: (state, action) => {
      state.orderBy = action.payload
    },
    setSelected: (state, action) => {
      state.selected = action.payload
    },
    setPage: (state, action) => {
      state.page = action.payload
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload
    },
    setOpenForm: (state, action) => {
      state.formOpen = action.payload
    },
    setPipeline: (state, action) => {
      state.selectedPipeline = action.payload
    },
    setLogOpenForm: (state, action) => {
      state.logsOpen = action.payload
    },
    setCodeBuildProject: (state, action) => {
      state.codeBuildProject = action.payload
    }
  },
  extraReducers: {
    [fetchAll.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      state.pipelines = action.payload;
    },
    [fetchAll.pending]: state => {
      state.loading = "yes";
    },
    [fetchAll.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.error.message;
    },

    [getLogs.fulfilled]: (state, action) => {
      state.loading = "idle";
      state.error = "";
      var logs = ""
      action.payload.forEach(l => {
        var lr = l.replace(/\r(?!\n)/g, "\n");
        logs = logs + lr;
      })
      state.logs = logs;
    },
    [getLogs.pending]: state => {
      state.loading = "yes";
      state.logs = [];
    },
    [getLogs.rejected]: (state, action) => {
      state.loading = "idle";
      state.error = action.error.message;
    },
  }
})

export const { setOrder, setOrderBy, setSelected, setPage, setRowsPerPage, setOpenForm, setPipeline, setLogOpenForm, setCodeBuildProject} = pipelineSlice.actions;

export const selectPipelines = state => state.pipeline.pipelines;
export const selectOrder = state => state.pipeline.order;
export const selectOrderBy = state => state.pipeline.orderBy;
export const selectSelected = state => state.pipeline.selected;
export const selectPage = state => state.pipeline.page;
export const selectRowsPerPage = state => state.pipeline.rowsPerPage;
export const selectOpenForm = state => state.pipeline.formOpen;
export const selectSelectedPipeline = state => state.pipeline.selectedPipeline;
export const selectLogFormOpen = state => state.pipeline.logsOpen;
export const selectCodeBuildProject = state => state.pipeline.codeBuildProject;
export const selectLogs = state => state.pipeline.logs;
export const selectLoading = state => state.pipeline.loading;

export default pipelineSlice.reducer;