import { vortex_scheduler } from "./scheduler.js";
import { Vortex_Worker } from "./worker.js";

export class VThread {
    filename;
    state;
    task;
    processId;
    result;
    startTime;
    completedTime;
    priority;
    worker;

    constructor(task, filename, priority = 0) {
        this.filename = filename;
        this.state = vortex_scheduler.T_STATE_WAITING;
        this.task = task;
        this.processId = vortex_scheduler.assignProcessId();
        this.result = 0;
        this.startTime = Date.now();
        this.priority = priority;

        this.worker = new Vortex_Worker();
    }

    async execute() {
        if (this.state !== vortex_scheduler.T_STATE_WAITING) {
            console.error(`Task not ready. PID: ${this.processId}`);
            return;
        }

        try {
            this.state = vortex_scheduler.T_STATE_RUNNING;

            console.log(`Executing task for PID: ${this.processId}`);
            this.result = await this.worker.call(this.task);

            console.log(`Task completed for PID: ${this.processId} with result: ${this.result}`);
            this.state = vortex_scheduler.T_STATE_FINISHED;
            this.completedTime = Date.now();

            console.log(`Thread PID: ${this.processId} finished in ${this.completedTime - this.startTime} ms, with exit code: ${this.result}`);
        } catch (error) {
            this.state = vortex_scheduler.T_STATE_FINISHED;
            console.error(`Thread runtime error, PID: ${this.processId} - ${error}`);
        } finally {
            this.worker.free();
        }
    }
};
