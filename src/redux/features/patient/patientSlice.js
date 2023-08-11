import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fhirClient } from "../../../url/clientDegiskeni";

const initialState = {
    patient: [],
    searchedPatient: [],
    response: {},
    searchedResponse: {},
    nextUrl: '',
    prevUrl: '',
    currentPage: 0,
    loading: false,
    error: null
}

export const getPatient = createAsyncThunk('getPatient', async ({ type, bundle }) => {
    let response;

    if (type === 'next') {
        response = await fhirClient.nextPage(bundle);
    }
    else if (type === 'prev') {
        response = await fhirClient.prevPage(bundle);
    }
    else {
        response = await fhirClient.search({
            resourceType: 'Patient',
            searchParams: { _count: '10',  _sort: '-_id', _total: 'accurate' }
        });
    }
    return response
});

export const getSearchedPatient = createAsyncThunk('getSearchedPatient', async ({ type, bundle, keyword }) => {
    let searchedResponse;
    if (type === 'next') {
        searchedResponse = await fhirClient.nextPage(bundle);
    }
    else if (type === 'prev') {
        searchedResponse = await fhirClient.prevPage(bundle);
    }
    else {
        searchedResponse = await fhirClient.search({
            resourceType: 'Patient',
            searchParams: { _count: '10', _sort: '-_id', _total: 'accurate', _content: keyword }
        });
    }

    if (searchedResponse.entry.length > 0) return searchedResponse;
    //return searchedResponse;

});

export const addPatient = createAsyncThunk('addPatinet', async (data) => {
    await fhirClient.create({
        resourceType: 'Patient', body: data
    });
});

export const deletePatient = createAsyncThunk('deletePatinet', async (id) => {
    await fhirClient.delete({resourceType: 'Patient', id});
    //return response
});

export const updatePatient = createAsyncThunk('updatePatinet', async (data) => {
    await fhirClient.update({
        resourceType: 'Patient', id: data.id?.[0], body: data
    });
});

export const patientSlice = createSlice({
    name: "patient",
    initialState,
    reducers: {
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },

    },
    extraReducers: (builder) => {
        //#region Patient AddCase
        builder.addCase(getPatient.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getPatient.fulfilled, (state, action) => {
            state.loading = false;
            state.response = action.payload;
            state.patient = action.payload?.entry.map(entry => entry.resource)
            state.nextUrl = action.payload?.link.find(link => link.relation === 'next')
            state.prevUrl = action.payload?.link.find(link => link.relation === 'prev')
        });
        builder.addCase(getPatient.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
        //#endregion

        //#region SearchPatient AddCase
        builder.addCase(getSearchedPatient.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getSearchedPatient.fulfilled, (state, action) => {
            state.loading = false;
            state.searchedResponse = action.payload;
            if (action.payload.entry) state.searchedPatient = action.payload?.entry.map(entry => entry.resource)
            state.nextUrl = action.payload?.link.find(link => link.relation === 'next')
            state.prevUrl = action.payload?.link.find(link => link.relation === 'prev')
        });
        builder.addCase(getSearchedPatient.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
        //#endregion

        //#region addPatient AddCase
        builder.addCase(addPatient.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addPatient.fulfilled, (state, action) => {
            state.loading = false;
            //state.response.push(action.payload);
        });
        builder.addCase(addPatient.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
        //#endregion

        //#region deletePatient AddCase
        builder.addCase(deletePatient.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deletePatient.fulfilled, (state, action) => {
            state.loading = false;
            //state.response = action.payload;
            //state.patient = action.payload?.entry.map(entry => entry.resource)
            //state.searchedResponse = action.payload;
            //if (action.payload?.entry) state.searchedPatient = action.payload?.entry.map(entry => entry.resource)
        });
        builder.addCase(deletePatient.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
        //#endregion
        
        //#region updatePatient AddCase
        builder.addCase(updatePatient.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updatePatient.fulfilled, (state, action) => {
            state.loading = false;
        });
        builder.addCase(updatePatient.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
        //#endregion
    }
})

export const { setCurrentPage } = patientSlice.actions;
export default patientSlice.reducer;
