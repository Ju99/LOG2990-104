import * as chai from 'chai';
import 'chai-http';
import { testingContainer } from '../../test/test-utils';
import { DatabaseService } from '../services/database.service';
import { DatabaseController } from './database.controller';
import { IndexController } from './index.controller';
chai.use(require('chai-http'));

// tslint:disable
// const HTTP_STATUS_OK = 200;
// const HTTP_STATUS_CREATED = 201;

describe('IndexController', () => {
    // let databaseService: Stubbed<DatabaseService>;
    // let app: Express.Application;
    let indexController: IndexController;

    beforeEach(async () => {
        indexController = new IndexController(new DatabaseController(new DatabaseService()));
        const [] = await testingContainer();
        // databaseService = container.get(TYPES.DatabaseService);
        // app = container.get<Application>(TYPES.Application).app;
    });

    it('should instanciate correctly', (done: Mocha.Done) => {
        // console.log(databaseService, app);
        chai.expect(indexController).to.be.instanceOf(IndexController);
        done();
    });
});
