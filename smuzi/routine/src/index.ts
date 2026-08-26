type Module = Record<string, (...args: any[]) => any>;

async function run_routine(balancer, path, method, args) {
    const task_id = balancer.task_id++;

    return new Promise((resolve, reject) => {
        balancer.tasks.set(task_id, {path, method, resolve, reject})
        getFreeWorker().postMessage({task_id, path, method, args})
    });
}

export function routine<M extends Module>(url: string, module: M): M {
    const newModule = {} as M;
    for (const method in module) {
            newModule[method] = (...args) => run_routine(balancer, path, method, args);
        }
    return module;
}