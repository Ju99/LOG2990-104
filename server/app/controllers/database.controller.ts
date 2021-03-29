import { DatabaseService } from '@app/services/database.service';
import { TYPES } from '@app/types';
import { DrawingData } from '@common/communication/drawing-data';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';

const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_NO_CONTENT = 204;
const HTTP_STATUS_NOT_FOUND = 404;
@injectable()
export class DatabaseController {
    router: Router;

    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * /api/database:
         *   get:
         *     description: Index du routage vers la base de données
         *     tags:
         *       - Index
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */
        this.router.get('/', (req: Request, res: Response, next: NextFunction) => {
            this.databaseService.drawingsCollection
                .find()
                .toArray()
                .then((result) => res.send(result))
                .catch((error) => res.send(error));
        });

        this.router.get('/drawings/filters/:tags?', (req: Request, res: Response, next: NextFunction) => {
            const params = req.params.tags;
            this.databaseService.getDrawingByTags(params).then((results) => {
                res.send(results);
            });
        });

        /**
         * @swagger
         *
         * /api/database/drawings:
         *   get:
         *     description: Retourne une liste de tous URLs des dessins sauvegardés sur le serveur
         *     tags:
         *       - Sauvegarde
         *       - Dessin
         *       - Base de données
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         schema:
         *           type: array
         *           items:
         *             $ref: '#/definitions/Message'
         */
        this.router.get('/drawings', (req: Request, res: Response, next: NextFunction) => {
            console.log('Mise à jour:', this.databaseService.drawingURLS);
            res.json(this.databaseService.drawingURLS);
        });

        /**
         * @swagger
         *
         * /api/database/send:
         *   post:
         *     description: Sauvegarde du dessin (canvas) sur le serveur au format PNG (base64) et envoie des métadonnées sur la base de données
         *     tags:
         *       - Base de données
         *       - Sauvegarde
         *       - Dessin
         *     requestBody:
         *         description: message object
         *         required: true
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/definitions/Message'
         *     produces:
         *       - application/json
         *     responses:
         *       201:
         *         description: Created
         */
        this.router.post('/send', (req: Request, res: Response, next: NextFunction) => {
            const drawing: DrawingData = req.body;
            this.databaseService
                .addDrawing(drawing)
                .then(() => {
                    res.sendStatus(HTTP_STATUS_CREATED);
                })
                .catch((error: Error) => {
                    res.status(HTTP_STATUS_NOT_FOUND);
                });
        });

        /**
         * @swagger
         *
         * /api/database/drawings/:title:
         *   get:
         *     description: Retourne le dessin dont le titre a été spécifié en paramètre
         *     tags:
         *       - Base de données
         *       - Dessin
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         schema:
         *           type: file
         *           items:
         *             $ref: '#/definitions/Message'
         */
        this.router.get('/drawings/:title', (req: Request, res: Response, next: NextFunction) => {
            res.sendFile(req.params.title, { root: 'saved-drawings/' });
        });

        /**
         * @swagger
         *
         * /api/database/drawings/:id:
         *   get:
         *     description: Supprime de la base de données le dessin avec l'id spécifié en paramètre
         *     tags:
         *       - Base de données
         *       - Dessin
         *     produces:
         *      - application/json
         *     responses:
         *       200:
         *         schema:
         *           type: file
         */
        this.router.delete('/drawings/:id', (req: Request, res: Response, next: NextFunction) => {
            const id = req.params.id.split('.')[0];
            this.databaseService
                .deleteDrawingByIdName(id)
                .then(() => {
                    res.sendStatus(HTTP_STATUS_NO_CONTENT);
                })
                .catch((error) => {
                    res.sendStatus(HTTP_STATUS_NOT_FOUND);
                });
        });
    }
}
