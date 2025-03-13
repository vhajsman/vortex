export class Vortex_Worker {
    worker;
    taskMap = {};
    busy;

    constructor() {
        this.worker = document.createElement("iframe");
        this.worker.style.display = "none";
        document.body.appendChild(this.worker);

        this.worker.contentWindow.onmessage = async (e) => {
            const { id, taskName, args } = e.data;
            console.log(`Worker received task: ${taskName} with args: ${JSON.stringify(args)}`);

            try {
                if (this.taskMap[taskName]) {
                    const result = await this.taskMap[taskName](...args);
                    console.log(`Worker returning result: ${result}`);
                    this.worker.contentWindow.postMessage({ id, result }, "*");
                } else {
                    throw new Error(`Task '${taskName}' not found.`);
                }
            } catch (error) {
                console.error(`Error in worker: ${error}`);
                this.worker.contentWindow.postMessage({ id, error: error.message }, "*");
            }
        };
    }

    registerTask(taskName, func) {
        this.taskMap[taskName] = func;
        console.log(`Task '${taskName}' registered.`);
    }

    async call(taskName, ...args) {
        const id = Math.random().toString(36).substring(2);
        console.log(`Posting task ${taskName} to worker with args: ${JSON.stringify(args)}`);

        this.worker.contentWindow.postMessage({
            id,
            taskName,
            args
        }, "*");

        return new Promise((resolve, reject) => {
            const handleMessage = (e) => {
                if (e.data.id === id) {
                    if (e.data.error) {
                        reject(new Error(e.data.error));
                    } else {
                        console.log(`Received result from worker: ${e.data.result}`);
                        resolve(e.data.result);
                    }

                    this.worker.contentWindow.removeEventListener("message", handleMessage);
                }
            };

            this.worker.contentWindow.addEventListener("message", handleMessage);
        });
    }

    free() {
        document.body.removeChild(this.worker);
    }
}