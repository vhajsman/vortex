export class Vortex_Worker {
    constructor() {
        this.worker = new Worker("worker/inject.js");
        this.busy = false;

        this.worker.onmessage = (event) => {
            this.handleMessage(event);
        };
    }

    handleMessage(event) {
        const { result, error } = event.data;
        if (error) {
            console.error("Worker error:", error);
            return;
        }

        console.log("Worker result:", result);
    }

    async call(taskData) {
        console.log(`Worker processing task`);

        return new Promise((resolve, reject) => {
            this.worker.onmessage = (event) => {
                if (event.data.error) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.result);
                }
            };

            this.worker.postMessage({ taskData });
        });
    }

    free() {
        this.worker.terminate();
        this.busy = false;
    }
}
