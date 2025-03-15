import { Vortex_ConfigManager } from "../configuration.js";
import { Vortex_Worker } from "./worker.js";

const NUMCPU_DEFAULT = 4;

export const vortex_scheduler = {
    pcount: 0,
    queue: [],
    runninglist: [],

    T_STATE_WAITING: 0,
    T_STATE_RUNNING: 1,
    T_STATE_PAUSED: 2,
    T_STATE_FINISHED: 3,

    workers: [],
    numcpu: null,

    assignProcessId() {
        this.pcount++;
        return this.pcount - 1;
    },

    addThread(thread) {
        console.log("Thread added: ", thread);
        this.queue.push(thread);
        this.queue.sort((a, b) => b.priority - a.priority);
    },

    async run() {
        console.log("Scheduler is running");
    
        while (true) {
            for (let i = 0; i < this.runninglist.length; i++) {
                const thread = this.runninglist[i];
                if (thread.state === this.T_STATE_FINISHED) {
                    this.runninglist.splice(i, 1);
                    i--;
                }
            }
    
            if (this.runninglist.length < this.numcpu && this.queue.length > 0) {
                const thread = this.queue.shift();
                this.runninglist.push(thread);
    
                console.log(`Starting thread with PID: ${thread.id}`);
                await thread.execute();
    
                console.log(`Thread PID: ${thread.id} finished`);
            }
    
            await new Promise(resolve => setTimeout(resolve, 20));
        }
    },

    getStatus() {
        return {
            threads_waiting: this.queue.map(thread => thread.id),
            threads_running: this.runninglist.map(thread => thread.id)
        };
    },

    async init() {
        let cpu_threads = await Vortex_ConfigManager.getKey("vortex", "hw_numcpu");
        if(cpu_threads == "auto" || cpu_threads == null)
            cpu_threads = navigator.hardwareConcurrency || NUMCPU_DEFAULT;

        this.numcpu = cpu_threads;
        console.log(`CPU threads for thread scheduler: numcpu=${this.numcpu}`);
    },

    assignWorker() {
        for(let worker of this.workers) {
            if(!worker.busy) {
                worker.busy = true;
                return worker;
            }
        }

        const nworker = new Vortex_Worker();
        nworker.busy = true;
        this.workers.push(nworker);

        return nworker;
    }
};