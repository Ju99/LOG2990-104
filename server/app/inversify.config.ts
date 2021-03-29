import { DatabaseController } from '@app/controllers/database.controller';
import { IndexController } from '@app/controllers/index.controller';
import { Container } from 'inversify';
import { Application } from './app';
import { Server } from './server';
import { DatabaseService } from './services/database.service';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();
    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);
    container.bind(TYPES.IndexController).to(IndexController);
    container.bind(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();
    container.bind(TYPES.DatabaseController).to(DatabaseController);
    return container;
};
