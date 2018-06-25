import { map, catchError } from 'rxjs/operators';
import { LoadClient, LoadClientSuccess, LoadClientFail, SelectClient } from './client.actions';
import { DataService } from './../services/data.service';
import { Client, DataApi } from './../models/data-api';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { of } from 'rxjs';
import { RouterState, RouterStateModel } from './router.state';
import { createEnitites } from './entity.utils';
import { EntityState } from './entity.model';
import { EntityService } from './entity.class';

export interface ClientStateModel extends EntityState<Client> {
  loading: boolean;
  failed: boolean;
  selectedId: string | number;
}

// const clientAdapter: EntityAdapter<Client> = createEntityAdapter<Client>({
//   selectId: (client: Client) => client.id
// });
const initialState: ClientStateModel = {
  ids: [],
  entities: {},
  loading: false,
  failed: false,
  selectedId: null
};

// const init: ClientStateModel = clientAdapter.getInitialState(initialState);

@State<ClientStateModel>({
  name: 'Client',
  defaults: initialState
})

export class ClientState {

  @Selector() static getAllClient(state: ClientStateModel) {
    return Object.values(state.entities);
  }

  @Selector([RouterState]) static getSelectedClient(state: ClientStateModel, router: RouterStateModel) {
    return router && state.entities[router.params.clientId];
  }

  @Selector() static isLoading(state: ClientStateModel) {
    return state.loading;
  }

  @Selector() static getClientEntities(state: ClientStateModel) {
    return state.entities;
  }

  @Selector() static getSelected(state: ClientStateModel) {
    return state.entities[state.selectedId];
  }

  constructor(private api: DataService, private ent: EntityService) { }

  //#region ---- Load List State ----
  @Action(LoadClient)
  loadClient({ getState, patchState, dispatch }: StateContext<ClientStateModel>) {
    const state = getState();
    patchState({
      ...state,
      loading: true
    });
    return this.api.list()
      .pipe(
        map((response: DataApi) => dispatch(new LoadClientSuccess(response.data.payload))),
        catchError(err => of(new LoadClientFail(err)))
      );
  }

  @Action(LoadClientSuccess)
  loadClientSuccess({ getState, patchState }: StateContext<ClientStateModel>, { payload }: LoadClientSuccess) {
    const state = getState();

    patchState({
      ...state,
      loading: false,
      // entities: createEnitites(payload, 'id', state)
      entities: this.ent.createEnitites(payload, 'id', state)
    });
  }

  @Action(LoadClientFail)
  loadClientFail({ getState, patchState }: StateContext<ClientStateModel>, { payload }: LoadClientFail) {
    const state = getState();
    patchState({
      ...state,
      loading: false,
      failed: true,
    });
  }

  @Action(SelectClient)
  ActionName({ getState, patchState }: StateContext<ClientStateModel>, { payload }: SelectClient) {
    const state = getState();
    patchState({
      ...state,
      selectedId: payload
    });
  }

  //#endregion;
}
