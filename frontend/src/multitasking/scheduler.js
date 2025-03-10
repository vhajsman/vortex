export const vortex_scheduler = {
    pcount: 0,
    queue: [],
    runninglist: [],

    T_STATE_WAITING: 0,
    T_STATE_RUNNING: 1,
    T_STATE_PAUSED: 2,
    T_STATE_FINISHED: 3,

    assignProcessId() {
        this.pcount++;
        return this.pcount - 1;
    },

    addThread(thread) {
        this.queue.push(thread);
        this.queue.sort((a, b) => b.priority - a.priority);
    },

    async run() {
        while(true) {
            for(let i = 0; i < this.runninglist.length; i++) {
                const thread = this.runninglist[i];
                if(thread.state === this.T_STATE_FINISHED) {
                    this.runninglist.splice(i, 1);
                    i--;
                }
            }

            if(this.runninglist.length < 1 && this.queue.length > 0) {
                const thread = this.queue.shift();
                this.runninglist.push(thread);

                await thread.execute().catch(error => {
                    console.error(`Thread runtime error, PID: ${thread.processId} - ${error}`);
                    thread.state = this.T_STATE_FINISHED;
                });
            }

            await new Promise(resolve => setTimeout(resolve, 20));
        }
    },

    getStatus() {
        return {
            threads_waiting: this.queue.map(thread => thread.id),
            threads_running: this.runninglist.map(thread => thread.id)
        };
    }
};