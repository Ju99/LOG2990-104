import { ObjectId } from 'bson';

export interface DrawingMetadata {
    _id?: ObjectId;
    title: string;
    labels?: string[];
}
