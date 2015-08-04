export function search(): Thenable<Party[]>;

interface Party {
    id: string;
    name: string;
}
