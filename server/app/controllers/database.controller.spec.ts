import * as chai from 'chai';
import { expect } from 'chai';
import 'chai-http';
import * as sinon from 'sinon';
import { testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import { DrawingData } from '../classes/drawing-data';
import { DatabaseService } from '../services/database.service';
import { TYPES } from '../types';
import { DatabaseController } from './database.controller';
chai.use(require('chai-http'));

// tslint:disable
const HTTP_OK = 200;

describe('Database Controller', () => {
    let application: Application;
    let databaseController: DatabaseController;
    let databaseService: DatabaseService;
    let testDrawing: DrawingData;

    beforeEach(async () => {
        await testingContainer().then((instance) => {
            application = instance[0].get<Application>(TYPES.Application);
            databaseController = instance[0].get<DatabaseController>(TYPES.DatabaseController);
            databaseService = instance[0].get<DatabaseService>(TYPES.DatabaseService);
        });

        testDrawing = {
            title: 'title',
            labels: ['tag1'],
            width: 100,
            height: 100,
            body: 'imageDataToUrl',
        };

        databaseService.drawingURLS = [`http://localhost:3000/api/database/drawings/${testDrawing.title}.png`];
    });

    it('should instanciate correctly', (done: Mocha.Done) => {
        chai.expect(databaseController).to.be.instanceOf(DatabaseController);
        done();
    });

    it('should call addDrawing when accessing api/database/send with POST request', (done: Mocha.Done) => {
        const stub = sinon.stub(DatabaseService.prototype, 'addDrawing');
        chai.request(application.app)
            .post('/api/database/send')
            .set('content-type', 'application/json')
            .send(testDrawing)
            .then(() => {
                chai.expect(stub.called).to.equal(true);
                stub.restore();
            });
        done();
    });

    it('should call deleteDrawingByIdName when accessing api/database/drawings/:id with DELETE request', (done: Mocha.Done) => {
        const stub = sinon.stub(DatabaseService.prototype, 'deleteDrawingByIdName');
        chai.request(application.app)
            .delete(`/api/database/drawings/${testDrawing.title}.png`)
            .then(() => {
                chai.expect(stub.called).to.equal(true);
                stub.restore();
            });
        done();
    });

    it('should send HTTP status 200 when accessing api/database/drawings with GET request', (done: Mocha.Done) => {
        chai.request(application.app)
            .get(`/api/database/drawings`)
            .set('content-type', 'application/json')
            .end((error, response) => {
                expect(response).to.equal(HTTP_OK);
                response.body.should.be.a('json');
            });
        done();
    });

    it('should send HTTP status 200 when accessing api/database/drawings/:title with GET request', (done: Mocha.Done) => {
        chai.request(application.app)
            .get(`/api/database/drawings/${testDrawing.title}.png`)
            .end((error, response) => {
                response.should.have.status(HTTP_OK);
                response.body.should.be.a('image/png');
            });
        done();
    });

    it('should call getDrawingByTags when accessing /drawings/filters/:tags? with GET request', (done: Mocha.Done) => {
        const stub = sinon.stub(DatabaseService.prototype, 'getDrawingByTags');
        chai.request(application.app)
            .get('/api/database/drawings/filters/:tags?')
            .then(() => {
                chai.expect(stub.called).to.equal(true);
                stub.restore();
            });
        done();
    });
});
