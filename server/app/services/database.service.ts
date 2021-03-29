import { DrawingMetadata } from '@app/classes/drawing-metadata';
import { BASE_URL, DATABASE_DRAWINGS_COLLECTION, DATABASE_MONGO_URL, DATABASE_NAME, DATABASE_URL, DRAWINGS_URL } from '@app/constants';
import { Drawing } from '@common/communication/drawing';
import { DrawingData } from '@common/communication/drawing-data';
import * as fs from 'fs';
import { injectable } from 'inversify';
import { Collection, Db, MongoClient, MongoClientOptions, ObjectId } from 'mongodb';
import 'reflect-metadata';

const SAVED_DRAWINGS_PATH = './saved-drawings/';
const IMAGE_FORMAT = 'png';
const DATA_ENCODING = 'base64';
const DATA_URL_BASE64_PREFIX = /^data:image\/\w+;base64,/;
const ALPHANUMERIC_REGEX = /^[a-z0-9]+$/i;
const MIN_LENGTH_TITLE = 1;
const MAX_LENGTH_INPUT = 15;
const NB_TAGS_ALLOWED = 5;
const HTTP_STATUS_NO_CONTENT = 204;
const HTTP_NOT_FOUND = 404;
@injectable()
export class DatabaseService {
    drawingsCollection: Collection<DrawingMetadata>;
    clientMessages: DrawingData[];
    drawingURLS: string[];

    private db: Db;
    private client: MongoClient;
    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    constructor() {
        this.clientMessages = [];
        this.drawingURLS = [];

        if (!fs.existsSync(SAVED_DRAWINGS_PATH)) {
            fs.mkdirSync(SAVED_DRAWINGS_PATH);
            console.log(`${SAVED_DRAWINGS_PATH} has been succesfully created!`);
        } else {
            console.log(`${SAVED_DRAWINGS_PATH} already exists on server.`);
        }

        this.readDrawingDirectory();
    }

    async start(url: string = DATABASE_MONGO_URL): Promise<MongoClient | null> {
        try {
            this.client = await MongoClient.connect(url, this.options);
            this.db = this.client.db(DATABASE_NAME);
            this.drawingsCollection = this.db.collection(DATABASE_DRAWINGS_COLLECTION);
        } catch {
            throw new Error('Database connection error');
        }

        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    async addDrawing(drawingData: DrawingData): Promise<number> {
        if (this.validateRequest(drawingData)) {
            const drawingMetadata: DrawingMetadata = {
                title: drawingData.title,
                labels: drawingData.labels ? drawingData.labels : undefined,
            };

            await this.drawingsCollection
                .insertOne(drawingMetadata)
                .then((result) => {
                    drawingData._id = result.insertedId.toHexString();
                    this.saveImageAsPNG(drawingData);
                    console.log(`Drawing ${drawingData.title} has been successfully added!`);
                    return HTTP_STATUS_NO_CONTENT;
                })
                .catch((error: Error) => {
                    console.error(`Failed to add drawing ${drawingData.title} to database`, error);
                    return HTTP_NOT_FOUND;
                });
        }

        return HTTP_NOT_FOUND;
    }

    async deleteDrawingByIdName(id: string): Promise<number> {
        const objectId = new ObjectId(id);
        return this.drawingsCollection
            .findOneAndDelete({ _id: objectId })
            .then(() => {
                this.deleteDrawingFromServer(id);
                console.log(`Drawing with id:${id} has been successfully deleted from database.`);
                return HTTP_STATUS_NO_CONTENT;
            })
            .catch((error) => {
                console.log(`Failed to delete drawing with id ${id}\n${error}`);
                return HTTP_NOT_FOUND;
            });
    }

    async getDrawingByTags(tags: string): Promise<Drawing[]> {
        return new Promise<Drawing[]>((resolve) => {
            const split = this.splitTags(tags);
            this.drawingsCollection
                .find({ labels: { $in: split } })
                .toArray()
                .then((result) => {
                    resolve(this.toDrawType(result));
                });
        });
    }

    toDrawType(data: DrawingMetadata[]): Drawing[] {
        const drawings = [];
        for (const drawing of data) {
            const previewUrl = drawing._id?.toHexString();
            const tag = drawing.labels;
            if (previewUrl !== undefined && tag !== undefined) {
                const draw: Drawing = {
                    name: drawing.title,
                    tags: tag,
                    imageURL: `${BASE_URL}${DATABASE_URL}${DRAWINGS_URL}/${previewUrl}.${IMAGE_FORMAT}`,
                };
                drawings.push(draw);
            }
        }
        return drawings;
    }

    private parseImageData(drawingData: DrawingData): Buffer {
        const metadata = drawingData.body.replace(DATA_URL_BASE64_PREFIX, '');
        const dataBuffer = Buffer.from(metadata, DATA_ENCODING);
        return dataBuffer;
    }

    private saveImageAsPNG(drawingData: DrawingData): void {
        const dataBuffer = this.parseImageData(drawingData);
        fs.writeFile(SAVED_DRAWINGS_PATH + drawingData._id + `.${IMAGE_FORMAT}`, dataBuffer, (error) => {
            if (error) throw error;
            this.drawingURLS.push(`${BASE_URL}${DATABASE_URL}${DRAWINGS_URL}/${drawingData._id}.${IMAGE_FORMAT}`);
            this.clientMessages.push(drawingData);
        });
    }

    private deleteDrawingFromServer(id: string): void {
        const url = SAVED_DRAWINGS_PATH + id + `.${IMAGE_FORMAT}`;
        fs.unlink(url, (error) => {
            if (error) {
                throw error;
            } else {
                console.log(`Drawing with id ${id} has been successfully deleted from server.`);
                this.readDrawingDirectory();
            }
        });
    }

    private validateRequestBody(body: string): boolean {
        return DATA_URL_BASE64_PREFIX.test(body);
    }

    private validateString(str: string, minLength: number): boolean {
        const isAlphanumeric = ALPHANUMERIC_REGEX.test(str);
        const isValidSize = str.length >= minLength && str.length <= MAX_LENGTH_INPUT;
        return isValidSize && isAlphanumeric;
    }

    private validateTags(tags: string[] | undefined): boolean {
        if (tags) {
            if (tags.length < 0 || tags.length > NB_TAGS_ALLOWED) return false;
            for (const tag in tags) {
                if (!this.validateString(tag, 0)) {
                    return false;
                }
            }
        }
        return true;
    }

    private validateRequest(request: DrawingData): boolean {
        return this.validateString(request.title, MIN_LENGTH_TITLE) && this.validateRequestBody(request.body) && this.validateTags(request.labels);
    }

    private readDrawingDirectory(): void {
        this.drawingURLS = [];
        fs.readdir(SAVED_DRAWINGS_PATH, (error, files) => {
            if (error) throw error;
            files.forEach((file) => {
                this.drawingURLS.push(`${BASE_URL}${DATABASE_URL}${DRAWINGS_URL}/${file}`);
            });
            console.log('Dessins actuellement sur le serveur:', this.drawingURLS);
        });
    }

    private splitTags(tag: string): string[] {
        return tag.split('-');
    }
}
