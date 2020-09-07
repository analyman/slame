
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

