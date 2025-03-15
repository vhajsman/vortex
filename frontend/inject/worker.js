onmessage = function(e) {
    const { taskData } = e.data;
    
    try {
        const result = executeTask(taskData);
        postMessage({ result });
    } catch (error) {
        postMessage({ error: error.message });
    }
};

function executeTask(taskData) {
    if (taskData && taskData.type === 'async') {
        return new Promise(resolve => {
            setTimeout(() => resolve(`Result from async task: ${taskData.delay}`), taskData.delay);
        });
    } else {
        return `Task executed with delay ${taskData.delay}`;
    }
}