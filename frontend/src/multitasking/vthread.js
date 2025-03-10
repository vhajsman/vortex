import { vortex_scheduler } from "./scheduler.js";

export class VThread {
    filename;
    state;
    task;
    processId;
    result;
    startTime;
    completedTime;
    priority;

    constructor(task, filename, priority = 0) {
        this.filename = filename;
        this.state = vortex_scheduler.T_STATE_WAITING;
        this.task = task;
        this.processId = vortex_scheduler.assignProcessId();
        this.result = 0;
        this.startTime = Date.now();
        this.priority = priority;
    }

    async execute() {
        if(this.state != vortex_scheduler.T_STATE_WAITING) {
            console.error(`Task not ready. PID: ${this.processId}`);
            return;
        }

        try {
            this.state = vortex_scheduler.T_STATE_RUNNING;
            this.result = await this.task();
            this.state = vortex_scheduler.T_STATE_FINISHED;

            this.completedTime = Date.now();

            console.log(`Thread PID: ${this.processId} finished in ${this.completedTime - this.startTime} ms, with exit code: ${this.result}`);
        } catch(error) {
            this.state = vortex_scheduler.T_STATE_FINISHED;
            console.error(`Thread runtime error, PID: ${this.processId} - ${error}`);
        }
    }
};