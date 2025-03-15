import { vortex_scheduler } from "./scheduler.js";
import { Vortex_Worker } from "./worker.js";

export class VThread {
    startTime;
    elapsed;

    constructor(task, taskName, priority) {
        this.task = task;
        this.taskName = taskName;
        this.priority = priority;
        this.id = vortex_scheduler.assignProcessId();
        this.state = vortex_scheduler.T_STATE_WAITING;
    }

    async execute() {
        this.state = vortex_scheduler.T_STATE_RUNNING;
        console.log(`Executing task for PID: ${this.id}`);

        this.startTime = Date.now();
        let result;

        try {
            result = await this.task();
            this.state = vortex_scheduler.T_STATE_FINISHED;
            this.result = result;

            // console.log(`Task completed for PID: ${this.id} with result: ${result}`);
        } catch (error) {
            this.state = vortex_scheduler.T_STATE_FINISHED;
            this.error = error.message;

            console.error(`Error in PID ${this.id}: ${error.message}`);
        }

        this.elapsed = Date.now() - this.startTime;
        console.log(`Task PID: ${this.id} completed in ${this.elapsed} ms with exit code: ${result}`);
    }
}
