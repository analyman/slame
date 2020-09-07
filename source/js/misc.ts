import * as gl from './global'
import * as utils from './utils'

function select_section() {
    if (gl.in_home_section)    gl.home_button.classList.add("active");
    if (gl.in_archive_section) gl.archive_button.classList.add("active");
    if (gl.in_about_section)   gl.about_button.classList.add("active");
}

export function do_misc() {
    utils.register_function_call(select_section);
}

