export class Drawing {
    name: string;
    tags: string[];
    imageURL?: string;

    constructor(name: string, tags: string[], imageURL?: string) {
        this.name = name;
        this.tags = tags;
        if (imageURL !== undefined) {
            this.imageURL = imageURL;
        }
    }
}
