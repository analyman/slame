
function getCaller () //{
{
    let reg = /\s+at (\S+)( \(([^)]+)\))?/g;
    let ee: string;
    try {throw new Error();}
    catch (e) {ee = e.stack;}
    reg.exec(ee);
    reg.exec(ee);
    let mm = reg.exec(ee);
    if (!mm) return null;
    return [mm[3] || "", mm[1]];
}; //}

export function debug(...argv) //{
{
    let caller = getCaller();
    let msg = "debug message";
    msg = caller ? `[${caller[1]} (${caller[0]})]: ` : `[${msg}]: `;
    console.debug(msg, ...argv);
} //}

export function assert_expr(v: boolean, err = "assert fail") //{
{
    if (v) return;
    let caller = getCaller();
    let msg = caller ? `[${caller[1]} (${caller[0]})]: ` : `[${err}]: `;
    throw msg;
} //}

let callback_stack: [Function, any[]][] = []
export function register_function_call(func, ...args) {
    assert_expr(typeof(func) === 'function');
    callback_stack.push([func, args]);
}

export function call_register_functions() {
    while(callback_stack.length > 0) {
        let fa = callback_stack.pop();
        try {
            fa[0].call(window, ...fa[1]);
        } catch (err) {
            console.error(err);
        }
    }
}

type howtocall = (elem: HTMLElement, add_func: () => void) => void;
/** when the timer expires just remove the class */
export function timeout_remove_class(elem: HTMLElement, has: boolean, 
                                     cls: string, time_ms: number, 
                                     when: howtocall) {
    let added: boolean = has;
    let timeout: number = 0;
    function _remove() {
        elem.classList.remove(cls);
        added = false;
        timeout = 0;
    }
    function _add() {
        if(!added) {
            elem.classList.add(cls);
            added = true;
        } else {
            window.clearTimeout(timeout);
        }
        timeout = window.setTimeout(_remove, time_ms);
    }

    when(elem, _add);
}

/** when the timer expires jsut add the class */
export function timeout_add_class(elem: HTMLElement, cls: string, has: boolean, 
                                  time_ms: number, when: howtocall) {
    let added: boolean = has;
    let timeout: number = 0;
    function _add() {
        elem.classList.add(cls);
        added = true;
        timeout = 0;
    }
    function _remove() {
        if(added) {
            elem.classList.remove(cls);
            added = false;
        } else {
            window.clearTimeout(timeout);
        }
        timeout = window.setTimeout(_add, time_ms);
    }

    when(elem, _remove);
}

export function text2html(str: string): HTMLElement 
{
    let div = document.createElement("div");
    div.innerHTML = str.trim();
    return div.firstChild as HTMLElement;
}

