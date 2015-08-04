
export function search(): Thenable<Party[]> {
    return new Promise((resolve, reject) => {
        resolve([
            { id: 1, name: "Party 1" },
            { id: 2, name: "Party 2" }
        ]);
    });
}

interface Party {
    id: string;
    name: string;
}
